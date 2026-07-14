import { ConvexError, v } from 'convex/values';
import { internalMutation, mutation, MutationCtx } from '../_generated/server';
import { internal } from '../_generated/api';
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
  getWaittimeData,
  getWaittimePingData,
} from '../common';
import { Doc, Id } from '../_generated/dataModel';
import { getAuthUserId } from '@convex-dev/auth/server';

export const checkNewSemesterUser = mutation({
  args: {},
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const user_id = await getAuthUserId(ctx);

    if (user_id) {
      await ctx.runMutation(internal.common.internalNewSemesterUser, {
        user_id: user_id,
      });
    }

    return true;
  },
});

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
      throw new ConvexError('Invalid announcement index');
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
      throw new ConvexError('Invalid announcement index');
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
    assignment_id: v.id('assignments'),
    override_cooldown: v.boolean(),
    email: v.optional(v.string()), // only used for TA created questions
  },
  returns: v.object({
    code: v.string(),
    data: v.optional(
      v.object({
        rejoin_time_ms: v.number(),
        waited_time_ms: v.number(),
      }),
    ),
  }),
  handler: async (ctx, args) => {
    const user_data = (await getCurrentUser(ctx))!;
    const curr_sem = await getCurrentSemester(ctx);

    // Handle TA created questions
    if (user_data.kind === 'TA') {
      if (!args.email) {
        throw new ConvexError('TA created questions must have an email');
      }

      const existing_user = await ctx.db
        .query('users')
        .withIndex('email', (q) => q.eq('email', args.email))
        .first();

      let student: Doc<'students'> | null = null;

      if (!existing_user) {
        // create a new user
        const name = args.email.split('@')[0];
        const newUser = await ctx.db.insert('users', {
          email: args.email,
          name: name,
        });

        await ctx.runMutation(internal.common.createStudentFromUser, {
          userId: newUser,
        });

        student = await ctx.db
          .query('students')
          .withIndex('by_user', (q) => q.eq('user_id', newUser))
          .first();
      } else {
        // get the student
        const existing_sem_user = await ctx.db
          .query('semesterUsers')
          .withIndex('by_sem_and_user', (q) =>
            q.eq('semester_id', curr_sem._id).eq('user_id', existing_user._id),
          )
          .first();

        let sem_user_id: Id<'semesterUsers'>;

        if (!existing_sem_user) {
          // add new student sem user
          const user_prefs = await ctx.db
            .query('userPreferences')
            .withIndex('by_user_id', (q) => q.eq('user_id', existing_user._id))
            .first();

          if (!user_prefs) {
            throw new ConvexError('User preferences not found');
          }

          sem_user_id = await ctx.db.insert('semesterUsers', {
            user_id: existing_user._id,
            user_prefs_id: user_prefs._id,
            semester_id: curr_sem._id,
            kind: 'student',
            notification: {
              title: '',
              body: '',
              timestamp: 0,
            },
          });

          await ctx.db.insert('students', {
            user_id: existing_user._id,
            user_prefs_id: user_prefs._id,
            semester_user_id: sem_user_id,
            num_questions: 0,
            time_on_queue_ms: 0,
            num_asked_to_fix: 0,
          });
        } else {
          sem_user_id = existing_sem_user._id;
        }

        student = await ctx.db
          .query('students')
          .withIndex('by_semuser', (q) => q.eq('semester_user_id', sem_user_id))
          .first();
      }

      if (!student) {
        throw new ConvexError('Student not found');
      }

      // enqueue student

      const existing_entry = await getQueueEntry(ctx, student._id);

      if (existing_entry) {
        throw new ConvexError('Student already on the queue');
      }

      const user = (await ctx.db.get(student.user_id))!;
      const prefs = (await ctx.db.get(student.user_prefs_id))!;

      const queue_length = await getQueueLength(ctx);
      const assignment_name = (await ctx.db.get(args.assignment_id))!.name;

      await ctx.db.insert('ohq', {
        student_id: student._id,
        student_name: prefs.preferred_name,
        student_email: user.email || '',
        created_by: 'TA',
        assignment_id: args.assignment_id,
        assignment_name: assignment_name,
        status: 'waiting',
        question: args.question,
        location: args.location,
        entry_time_ms: Date.now(),
        messages_from_tas: [],
        position: queue_length,
        num_asked_to_fix: 0,
        has_unread_messages: false,
      });

      await sendQueueJoinNotifs(ctx, prefs.preferred_name, assignment_name);
    }
    // handle student created questions
    else {
      const globalSettings = await getGlobalSettings(ctx);

      // check queue not frozen
      if (globalSettings.is_frozen) {
        throw new ConvexError('Queue is frozen');
      }

      const student = (await ctx.db
        .query('students')
        .withIndex('by_semuser', (q) => q.eq('semester_user_id', user_data.sem_user_id))
        .first())!;

      const existing_entry = await getQueueEntry(ctx, student._id);

      if (existing_entry) {
        throw new ConvexError('Student already on the queue');
      }

      // check if student is allowed to ask questions
      if (curr_sem.enable_whitelist) {
        if (!curr_sem.whitelist.includes(student.user_id)) {
          throw new ConvexError('Student is not on the whitelist');
        }
      }

      if (curr_sem.enable_blacklist) {
        if (curr_sem.blacklist.includes(student.user_id)) {
          throw new ConvexError('Student is on the blacklist');
        }
      }

      // check for cooldown override

      // if override disabled, throw error
      if (args.override_cooldown && !globalSettings.allow_cooldown_override) {
        throw new ConvexError('Cooldown override is disabled');
      }

      // if override enabled, check if they're allowed to override
      // else if (args.override_cooldown) {
      // check if they've asked a question in the last rejoin_time_ms
      const rejoin_time_ms = globalSettings.rejoin_time_ms;

      const lastQuestion = await ctx.db
        .query('questions')
        .withIndex('by_student_and_finished_by', (q) =>
          q.eq('student_id', student._id).eq('finished_by', 'helped'),
        )
        .order('desc')
        .first();

      if (lastQuestion) {
        if (lastQuestion.exit_time_ms > Date.now() - rejoin_time_ms) {
          if (!args.override_cooldown) {
            return {
              code: 'COOLDOWN_VIOLATION',
              data: {
                rejoin_time_ms: rejoin_time_ms,
                waited_time_ms: Date.now() - lastQuestion.exit_time_ms,
              },
            };
          }
        }
      }

      // enqueue student
      const queue_length = await getQueueLength(ctx);

      const user = (await ctx.db.get(student.user_id))!;
      const prefs = (await ctx.db.get(student.user_prefs_id))!;
      const assignment_name = (await ctx.db.get(args.assignment_id))!.name;

      await ctx.db.insert('ohq', {
        student_id: student._id,
        student_name: prefs.preferred_name,
        student_email: user.email || '',
        created_by: 'student',
        assignment_id: args.assignment_id,
        assignment_name: assignment_name,
        status: args.override_cooldown ? 'cooldown_violation' : 'waiting',
        question: args.question,
        location: args.location,
        entry_time_ms: Date.now(),
        messages_from_tas: [],
        position: queue_length,
        num_asked_to_fix: 0,
        has_unread_messages: false,
      });

      await sendQueueJoinNotifs(ctx, prefs.preferred_name, assignment_name);
    }

    return {
      code: 'SUCCESS',
      data: undefined,
    };
  },
});

async function sendQueueJoinNotifs(ctx: MutationCtx, name: string, assignment: string) {
  // update every TA's notification field if their prefs are set to get queue join notifs
  const tas_with_notifs = await ctx.db
    .query('tas')
    .filter((x) => x.eq(x.field('join_notifs_enabled'), true))
    .collect();

  await Promise.all(
    tas_with_notifs.map(async (ta) => {
      await ctx.runMutation(internal.common.internalSendNotification, {
        semester_user: ta.semester_user_id,
        title: 'New Queue Entry',
        body: `Name: ${name}\nAssignment: ${assignment}`,
      });
    }),
  );
}

// Remove student, write to database
export const removeStudent = mutation({
  args: {
    student_id: v.id('students'),
    reason: v.union(v.literal('helped'), v.literal('removed')),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user_data = (await getCurrentUser(ctx))!;

    const existing_entry = (await getQueueEntry(ctx, args.student_id))!;

    // If student is removing, must be removing themselves
    if (user_data.kind === 'student') {
      const student = (await getStudent(ctx, user_data.sem_user_id))!;

      if (args.student_id !== student._id) {
        throw new ConvexError('Student is not removing themselves');
      }
    } else if (user_data.kind !== 'TA') {
      throw new ConvexError('User is not a student or TA');
    }

    // remove from OHQ
    await ctx.runMutation(internal.common.removeQueueEntry, {
      queue_entry_id: existing_entry._id,
    });

    const student_to_remove = (await ctx.db.get(args.student_id))!;

    // add question to database
    const curr_sem = await getCurrentSemester(ctx);

    let removal_ta: Doc<'tas'> | undefined = undefined;
    if (user_data.kind === 'TA') {
      removal_ta = await getTA(ctx, user_data.sem_user_id);
    }

    if (args.reason === 'helped') {
      if (user_data.kind !== 'TA') {
        throw new ConvexError('Removing user is not a TA but reason is helped');
      }
      if (existing_entry.status !== 'being_helped') {
        throw new ConvexError('Student is not being helped but reason is helped');
      }
      if (existing_entry.help_start_time_ms === undefined) {
        throw new ConvexError('Student is being helped but help start time is undefined');
      }
      if (existing_entry.helping_ta!.ta_id !== removal_ta!._id) {
        throw new ConvexError(
          'Student is being helped by a different TA than the one removing them, but reason is helped',
        );
      }
    }

    const help_duration_ms =
      args.reason === 'helped' ? Date.now() - existing_entry.help_start_time_ms! : -1;

    await ctx.db.insert('questions', {
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
      help_duration_ms: help_duration_ms,
      num_asked_to_fix: existing_entry.num_asked_to_fix,
    });

    if (args.reason === 'removed') {
      // notify the student
      await ctx.runMutation(internal.common.internalSendNotification, {
        semester_user: student_to_remove.semester_user_id,
        title: "You've been removed from the queue",
        body: '',
      });
    }

    if (args.reason === 'helped') {
      const help_duration_mins = help_duration_ms / 60000;
      const help_duration_mins_rounded = Math.round(help_duration_mins);
      // notify the TA
      await ctx.runMutation(internal.common.internalSendNotification, {
        semester_user: removal_ta!.semester_user_id,
        title: 'Done Helping!',
        body: `You helped ${existing_entry.student_name} for ${help_duration_mins_rounded} minutes`,
      });
    }
  },
});

export const helpStudent = mutation({
  args: {
    student_id: v.id('students'),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { ta } = await ensureAuthAndTA(ctx);
    const student_to_help = (await ctx.db.get(args.student_id))!;
    const existing_entry = (await getQueueEntry(ctx, student_to_help._id))!;

    if (existing_entry.helping_ta !== undefined || existing_entry.status === 'being_helped') {
      throw new ConvexError('Student is already being helped');
    }

    const ta_prefs = (await ctx.db.get(ta.user_prefs_id))!;

    await ctx.db.patch(existing_entry._id, {
      helping_ta: {
        ta_id: ta._id,
        preferred_name: ta_prefs.preferred_name,
        zoom_enabled: ta.zoom_enabled,
        zoom_url: ta.zoom_url,
      },
      status: 'being_helped',
      help_start_time_ms: Date.now(),
    });

    // notify the student
    await ctx.runMutation(internal.common.internalSendNotification, {
      semester_user: student_to_help.semester_user_id,
      title: "It's your turn to get help!",
      body: `${ta_prefs.preferred_name} is ready to help you.`,
    });

    // notify the TA in the future at their remind time if they have reminders enabled
    if (ta.remind_notifs_enabled) {
      const remind_time_ms = ta.remind_time_mins * 60000;
      await ctx.scheduler.runAfter(remind_time_ms, internal.home.home_mutate.internalRemindTA, {
        ta_helping: ta._id,
        student_helping: student_to_help._id,
        title: 'Time Alert!',
        body: `You've been helping for ${ta.remind_time_mins} minutes!`,
      });
    }
  },
});

export const internalRemindTA = internalMutation({
  args: {
    ta_helping: v.id('tas'),
    student_helping: v.id('students'),
    title: v.string(),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    // check if the TA is still helping the student
    const existing_entry = await getQueueEntry(ctx, args.student_helping);
    if (
      existing_entry === null ||
      existing_entry.status !== 'being_helped' ||
      existing_entry.helping_ta!.ta_id !== args.ta_helping
    ) {
      return;
    }

    // check if the TA still has reminders enabled
    const ta = (await ctx.db.get(args.ta_helping))!;

    if (!ta.remind_notifs_enabled) {
      return;
    }

    await ctx.runMutation(internal.common.internalSendNotification, {
      semester_user: ta.semester_user_id,
      title: args.title,
      body: args.body,
    });
  },
});

export const unhelpStudent = mutation({
  args: {
    student_id: v.id('students'),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { ta } = await ensureAuthAndTA(ctx);
    const student_to_unhelp = (await ctx.db.get(args.student_id))!;
    const existing_entry = (await getQueueEntry(ctx, student_to_unhelp._id))!;

    if (existing_entry.status !== 'being_helped') {
      throw new ConvexError('Student is not being helped');
    }

    if (existing_entry.helping_ta?.ta_id !== ta._id) {
      throw new ConvexError('TA is not helping this student');
    }

    await ctx.db.patch(existing_entry._id, {
      helping_ta: undefined,
      help_start_time_ms: undefined,
      status: 'waiting',
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

    if (existing_entry.question === args.question) {
      throw new ConvexError('Question is the same');
    }

    await ctx.db.patch(existing_entry._id, {
      question: args.question,
      status: 'waiting',
    });
  },
});

export const askToFixQuestion = mutation({
  args: {
    student_id: v.id('students'),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ensureAuthAndTA(ctx);
    const existing_entry = (await getQueueEntry(ctx, args.student_id))!;

    await ctx.db.patch(existing_entry._id, {
      status: 'fixing_question',
      num_asked_to_fix: existing_entry.num_asked_to_fix + 1,
    });

    const student_sem_user = (await ctx.db.get(args.student_id))!.semester_user_id;

    // notify the student
    await ctx.runMutation(internal.common.internalSendNotification, {
      semester_user: student_sem_user,
      title: 'Please update your question',
      body: 'A TA has requested that you update your question.',
    });
  },
});

export const messageStudent = mutation({
  args: {
    student_id: v.id('students'),
    message: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { ta } = await ensureAuthAndTA(ctx);
    const existing_entry = (await getQueueEntry(ctx, args.student_id))!;

    if (existing_entry.status === 'being_helped') {
      throw new ConvexError('You cannot message a student while they are being helped');
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

    const student_sem_user = (await ctx.db.get(args.student_id))!.semester_user_id;

    // notify the student
    await ctx.runMutation(internal.common.internalSendNotification, {
      semester_user: student_sem_user,
      title: "You've been messaged by a TA",
      body: '',
    });
  },
});

export const dismissMessage = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx, args) => {
    const { student } = await ensureAuthAndStudent(ctx);

    const existing_entry = (await getQueueEntry(ctx, student._id))!;

    await ctx.db.patch(existing_entry._id, {
      has_unread_messages: false,
    });
  },
});

export const approveCooldownOverride = mutation({
  args: {
    student_id: v.id('students'),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ensureAuthAndTA(ctx);

    const existing_entry = (await getQueueEntry(ctx, args.student_id))!;

    const adminSettings = await getGlobalSettings(ctx);

    if (!adminSettings.allow_cooldown_override) {
      throw new ConvexError('Cooldown override is disabled');
    }

    if (existing_entry.status !== 'cooldown_violation') {
      throw new ConvexError('Student is not on cooldown violation');
    }

    await ctx.db.patch(existing_entry._id, {
      status: 'waiting',
    });

    const student_sem_user = (await ctx.db.get(args.student_id))!.semester_user_id;

    // notify the student
    await ctx.runMutation(internal.common.internalSendNotification, {
      semester_user: student_sem_user,
      title: 'Your entry has been approved by a TA',
      body: '',
    });
  },
});

export const internalWaittimeIntervalCheck = internalMutation({
  args: {},
  handler: async (ctx, args) => {
    const global_settings = await getGlobalSettings(ctx);
    const waittimePingData = await getWaittimePingData(ctx);

    const minute_ago_waittime = waittimePingData.minute_ago_waittime;
    const last_pinged = waittimePingData.last_pinged;
    const ping_threshold_mins = global_settings.waittime_ping_threshold_mins;
    const ping_interval_mins = global_settings.waittime_ping_interval_mins;

    const waittime_data = await getWaittimeData(
      ctx,
      global_settings.waittime_questions_lookback_time_mins,
    );

    // decide if we want to ping again
    // if we've waited the ping interval
    const ping_interval_ms = ping_interval_mins * 60000;
    if (new Date().getTime() - last_pinged >= ping_interval_ms) {
      // if the minute ago waittime and current waittime are both above threshold (stops spikes)
      if (
        waittime_data.wait_time > ping_threshold_mins &&
        minute_ago_waittime > ping_threshold_mins
      ) {
        const wait_time_mins_rounded = Math.round(waittime_data.wait_time);

        await ctx.scheduler.runAfter(0, internal.actions.sendSlackbotMessage, {
          message: `<!channel> The wait time is ${wait_time_mins_rounded} minutes right now. More TAs might be needed.`,
        });

        // update the last pinged time
        await ctx.db.patch(waittimePingData._id, {
          last_pinged: new Date().getTime(),
        });
      }
    }

    // update the minute ago waittime
    await ctx.db.patch(waittimePingData._id, {
      minute_ago_waittime: waittime_data.wait_time,
    });
  },
});

export const firstTimeSetup = mutation({
  args: {
    semester_name: v.string(),
    owner_emails: v.array(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // verify that there is no globalsettings object (this should only happen at the very very beginning)

    const existing_global_settings = await ctx.db.query('globalSettings').collect();

    if (existing_global_settings.length > 0) {
      throw new ConvexError('Global settings already exists');
    }

    // create new semester and its "Other" assignment
    const new_sem = await ctx.db.insert('semesters', {
      name: args.semester_name,
      owner_emails: args.owner_emails,
      enable_whitelist: false,
      enable_blacklist: false,
      whitelist: [],
      blacklist: [],
      other_assignment: undefined,
    });

    const other_assignment = await ctx.db.insert('assignments', {
      name: 'Other',
      semester_id: new_sem,
      assignment_type: undefined,
      start_date_ms: 0,
      end_date_ms: 0,
    });

    await ctx.db.patch(new_sem, {
      other_assignment: other_assignment,
    });

    // create the global settings object
    await ctx.db.insert('globalSettings', {
      curr_sem: new_sem,
      course_name: 'OHQ',
      timezone: 'UTC',
      slackbot_webhook_url: undefined,
      questions_policy_url: undefined,
      rejoin_time_ms: 15 * 60000,
      allowed_email_domains: [],
      enforce_email_domain: false,
      allow_cooldown_override: false,
      // -1 is used as list of all locations (stupid legacy decision that we're just gonna keep living with forever lol)
      day_to_location_dict: {
        '-1': [],
        '0': [],
        '1': [],
        '2': [],
        '3': [],
        '4': [],
        '5': [],
        '6': [],
      },
      allow_tas_show_others_timer: false,
      waittime_ping_threshold_mins: 30,
      waittime_ping_interval_mins: 10,
      waittime_questions_lookback_time_mins: 60,
      is_frozen: true,
      announcements: [],
      sql_module_enabled: false,
    });

    await ctx.db.insert('waittime_ping_data', {
      minute_ago_waittime: 0,
      last_pinged: 0,
    });
  },
});
