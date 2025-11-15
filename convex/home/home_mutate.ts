import { ConvexError, v } from "convex/values";
import { mutation } from "../_generated/server";
import { internal } from "../_generated/api";
import {
  ensureAuthAndStudent,
  ensureAuthAndTA,
  getCurrentSemester,
  getCurrentUser,
  getGlobalSettings,
  getQueueEntry,
  getQueueLength,
  getStudent,
  getTA,
} from "../common";
import { Doc } from "../_generated/dataModel";

export const freezeQueue = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx, args) => {
    await ensureAuthAndTA(ctx);

    const globalSettings = await getGlobalSettings(ctx);

    await ctx.db.patch(globalSettings._id, {
      is_frozen: true,
    });
  },
});

export const unfreezeQueue = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx, args) => {
    await ensureAuthAndTA(ctx);

    const globalSettings = await getGlobalSettings(ctx);

    await ctx.db.patch(globalSettings._id, {
      is_frozen: false,
    });
  },
});

export const createAnnouncement = mutation({
  args: {
    content: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ensureAuthAndTA(ctx);

    const globalSettings = await getGlobalSettings(ctx);

    await ctx.db.patch(globalSettings._id, {
      announcements: [...globalSettings.announcements, args.content],
    });
  },
});

export const updateAnnouncement = mutation({
  args: {
    idx: v.number(),
    content: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ensureAuthAndTA(ctx);

    const globalSettings = await getGlobalSettings(ctx);

    if (args.idx < 0 || args.idx >= globalSettings.announcements.length) {
      throw new ConvexError("Invalid announcement index");
    }

    const curr_announcements = globalSettings.announcements;
    curr_announcements[args.idx] = args.content;

    await ctx.db.patch(globalSettings._id, {
      announcements: curr_announcements,
    });
  },
});

export const deleteAnnouncement = mutation({
  args: {
    idx: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ensureAuthAndTA(ctx);

    const globalSettings = await getGlobalSettings(ctx);

    if (args.idx < 0 || args.idx >= globalSettings.announcements.length) {
      throw new ConvexError("Invalid announcement index");
    }

    const curr_announcements = globalSettings.announcements;
    curr_announcements.splice(args.idx, 1);

    await ctx.db.patch(globalSettings._id, {
      announcements: curr_announcements,
    });
  },
});

export const addQuestion = mutation({
  args: {
    question: v.string(),
    location: v.string(),
    assignment_id: v.id("assignments"),
    override_cooldown: v.boolean(),
    email: v.optional(v.string()), // only used for TA created questions
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user_data = (await getCurrentUser(ctx))!;

    // Handle TA created questions
    if (user_data.kind == "TA") {
      if (!args.email) {
        throw new ConvexError("TA created questions must have an email");
      }

      const existingUser = await ctx.db
        .query("users")
        .withIndex("email", (q) => q.eq("email", args.email))
        .first();

      let student: Doc<"students"> | null = null;

      if (!existingUser) {
        // create a new user
        let name = args.email.split("@")[0];
        const newUser = await ctx.db.insert("users", {
          email: args.email,
          name: name,
        });

        await ctx.runMutation(internal.common.createStudentFromUser, {
          userId: newUser,
        });

        student = await ctx.db
          .query("students")
          .withIndex("by_user", (q) => q.eq("user_id", newUser))
          .first();
      } else {
        // get the student
        student = await ctx.db
          .query("students")
          .withIndex("by_user", (q) => q.eq("user_id", existingUser._id))
          .first();
      }

      if (!student) {
        throw new ConvexError("Student not found");
      }

      // enqueue student

      const existing_entry = await getQueueEntry(ctx, student._id);

      if (existing_entry) {
        throw new ConvexError("Student already on the queue");
      }

      const user = (await ctx.db.get(student.user_id))!;
      const prefs = (await ctx.db.get(student.user_prefs_id))!;

      const queue_length = await getQueueLength(ctx);

      await ctx.db.insert("ohq", {
        student_id: student._id,
        student_name: prefs.preferred_name,
        student_email: user.email || "",
        created_by: "TA",
        assignment_id: args.assignment_id,
        assignment_name: (await ctx.db.get(args.assignment_id))!.name,
        status: "waiting",
        question: args.question,
        location: args.location,
        entry_time_ms: Date.now(),
        messages_from_tas: [],
        position: queue_length,
        num_asked_to_fix: 0,
        has_unread_messages: false,
      });
    }
    // handle student created questions
    else {
      const globalSettings = await getGlobalSettings(ctx);

      // check queue not frozen
      if (globalSettings.is_frozen) {
        throw new ConvexError("Queue is frozen");
      }

      const student = (await ctx.db
        .query("students")
        .withIndex("by_user", (q) => q.eq("user_id", user_data._id))
        .first())!;

      const existing_entry = await getQueueEntry(ctx, student._id);

      if (existing_entry) {
        throw new ConvexError("Student already on the queue");
      }

      // check if student is allowed to ask questions
      const curr_sem = await getCurrentSemester(ctx);

      if (curr_sem.enable_whitelist) {
        if (!curr_sem.whitelist.includes(student.user_id)) {
          throw new ConvexError("Student is not on the whitelist");
        }
      }

      if (curr_sem.enable_blacklist) {
        if (curr_sem.blacklist.includes(student.user_id)) {
          throw new ConvexError("Student is on the blacklist");
        }
      }

      // check for cooldown override

      // if override disabled, throw error
      if (args.override_cooldown && !globalSettings.allow_cooldown_override) {
        throw new ConvexError("Cooldown override is disabled");
      }

      // if override enabled, check if they're allowed to override
      // else if (args.override_cooldown) {
      // check if they've asked a question in the last rejoin_time_ms
      const rejoin_time_ms = globalSettings.rejoin_time_ms;

      const lastQuestion = await ctx.db
        .query("questions")
        .withIndex("by_student_and_exit_time", (q) =>
          q.eq("student_id", student._id),
        )
        .filter((q) => q.neq(q.field("help_time_ms"), -1))
        .order("desc")
        .first();

      if (lastQuestion) {
        if (lastQuestion.exit_time_ms > Date.now() - rejoin_time_ms) {
          if (!args.override_cooldown) {
            throw new ConvexError({
              code: "COOLDOWN_VIOLATION",
              rejoin_time_ms: rejoin_time_ms,
              waited_time_ms: Date.now() - lastQuestion.exit_time_ms,
            });
          }
        }
      }
      // }

      // enqueue student
      const queue_length = await getQueueLength(ctx);

      const user = (await ctx.db.get(student.user_id))!;
      const prefs = (await ctx.db.get(student.user_prefs_id))!;

      await ctx.db.insert("ohq", {
        student_id: student._id,
        student_name: prefs.preferred_name,
        student_email: user.email || "",
        created_by: "student",
        assignment_id: args.assignment_id,
        assignment_name: (await ctx.db.get(args.assignment_id))!.name,
        status: "waiting",
        question: args.question,
        location: args.location,
        entry_time_ms: Date.now(),
        messages_from_tas: [],
        position: queue_length,
        num_asked_to_fix: 0,
        has_unread_messages: false,
      });
    }
  },
});

// Remove student, write to database
export const removeStudent = mutation({
  args: {
    student_id: v.id("students"),
    reason: v.union(v.literal("helped"), v.literal("removed")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user_data = (await getCurrentUser(ctx))!;

    const existing_entry = (await getQueueEntry(ctx, args.student_id))!;

    // If student is removing, must be removing themselves
    if (user_data.kind == "student") {
      const student = (await getStudent(ctx, user_data.sem_user_id))!;

      if (args.student_id !== student._id) {
        throw new ConvexError("Student is not removing themselves");
      }
    } else if (user_data.kind != "TA") {
      throw new ConvexError("User is not a student or TA");
    }

    // remove from OHQ
    await ctx.runMutation(internal.common.removeQueueEntry, {
      queue_entry_id: existing_entry._id,
    });

    const student_to_remove = (await ctx.db.get(args.student_id))!;

    // add question to database
    const curr_sem = await getCurrentSemester(ctx);

    let removal_ta = undefined;
    if (user_data.kind == "TA") {
      removal_ta = await getTA(ctx, user_data.sem_user_id);
    }

    if (args.reason === "helped") {
      if (user_data.kind !== "TA") {
        throw new ConvexError("Removing user is not a TA but reason is helped");
      }
      if (existing_entry.status !== "being_helped") {
        throw new ConvexError(
          "Student is not being helped but reason is helped",
        );
      }
      if (existing_entry.help_start_time_ms === undefined) {
        throw new ConvexError(
          "Student is being helped but help start time is undefined",
        );
      }
      if (existing_entry.helping_ta!.ta_id !== removal_ta!._id) {
        throw new ConvexError(
          "Student is being helped by a different TA than the one removing them, but reason is helped",
        );
      }
    }

    await ctx.db.insert("questions", {
      semester_id: curr_sem._id,
      assignment_id: existing_entry.assignment_id,
      student_id: student_to_remove._id,
      ta_id: removal_ta?._id,

      question: existing_entry.question,
      location: existing_entry.location,

      created_by: existing_entry.created_by,
      finished_by: args.reason,

      entry_time_ms: existing_entry.entry_time_ms,
      exit_time_ms: Date.now(),
      // if they were being helped, store help duration, otherwise -1
      help_time_ms:
        args.reason === "helped"
          ? Date.now() - existing_entry.help_start_time_ms!
          : -1,

      num_asked_to_fix: existing_entry.num_asked_to_fix,
    });
  },
});

export const helpStudent = mutation({
  args: {
    student_id: v.id("students"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { ta } = await ensureAuthAndTA(ctx);
    const student_to_help = (await ctx.db.get(args.student_id))!;
    const existing_entry = await getQueueEntry(ctx, student_to_help._id);

    if (
      existing_entry.helping_ta !== undefined ||
      existing_entry.status === "being_helped"
    ) {
      throw new ConvexError("Student is already being helped");
    }

    const ta_prefs = (await ctx.db.get(ta.user_prefs_id))!;

    await ctx.db.patch(existing_entry._id, {
      helping_ta: {
        ta_id: ta._id,
        preferred_name: ta_prefs.preferred_name,
        zoom_enabled: ta.zoom_enabled,
        zoom_url: ta.zoom_url,
      },
      status: "being_helped",
      help_start_time_ms: Date.now(),
    });
  },
});

export const unhelpStudent = mutation({
  args: {
    student_id: v.id("students"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { ta } = await ensureAuthAndTA(ctx);
    const student_to_unhelp = (await ctx.db.get(args.student_id))!;
    const existing_entry = await getQueueEntry(ctx, student_to_unhelp._id);

    if (existing_entry.status !== "being_helped") {
      throw new ConvexError("Student is not being helped");
    }

    if (existing_entry.helping_ta?.ta_id !== ta._id) {
      throw new ConvexError("TA is not helping this student");
    }

    await ctx.db.patch(existing_entry._id, {
      helping_ta: undefined,
      help_start_time_ms: undefined,
      status: "waiting",
    });
  },
});

export const updateQuestion = mutation({
  args: {
    question: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user_data = (await getCurrentUser(ctx))!;
    const student = (await getStudent(ctx, user_data.sem_user_id))!;

    const existing_entry = (await getQueueEntry(ctx, student._id))!;

    if (existing_entry.question == args.question) {
      throw new ConvexError("Question is the same");
    }

    await ctx.db.patch(existing_entry._id, {
      question: args.question,
      status: "waiting",
    });
  },
});

export const askToFixQuestion = mutation({
  args: {
    student_id: v.id("students"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ensureAuthAndTA(ctx);
    const existing_entry = await getQueueEntry(ctx, args.student_id);

    await ctx.db.patch(existing_entry._id, {
      status: "fixing_question",
      num_asked_to_fix: existing_entry.num_asked_to_fix + 1,
    });
  },
});

export const messageStudent = mutation({
  args: {
    student_id: v.id("students"),
    message: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { ta } = await ensureAuthAndTA(ctx);
    const existing_entry = await getQueueEntry(ctx, args.student_id);

    if (existing_entry.status == "being_helped") {
      throw new ConvexError(
        "You cannot message a student while they are being helped",
      );
    }

    const ta_prefs = (await ctx.db.get(ta.user_prefs_id))!;

    await ctx.db.patch(existing_entry._id, {
      messages_from_tas: [
        ...existing_entry.messages_from_tas,
        {
          from_ta_id: ta._id,
          from_ta_name: ta_prefs.preferred_name,
          message: args.message,
          sent_time_ms: Date.now(),
        },
      ],
      has_unread_messages: true,
    });
  },
});

export const dismissMessage = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx, args) => {
    const { student } = await ensureAuthAndStudent(ctx);

    const existing_entry = await getQueueEntry(ctx, student._id);

    await ctx.db.patch(existing_entry._id, {
      has_unread_messages: false,
    });
  },
});

export const approveCooldownOverride = mutation({
  args: {
    student_id: v.id("students"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ensureAuthAndTA(ctx);

    const existing_entry = await getQueueEntry(ctx, args.student_id);

    const adminSettings = await getGlobalSettings(ctx);

    if (!adminSettings.allow_cooldown_override) {
      throw new ConvexError("Cooldown override is disabled");
    }

    if (existing_entry.status !== "cooldown_violation") {
      throw new ConvexError("Student is not on cooldown violation");
    }

    await ctx.db.patch(existing_entry._id, {
      status: "waiting",
    });
  },
});
