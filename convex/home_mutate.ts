import { ConvexError, v } from 'convex/values';
import { mutation } from './_generated/server';
import { internal } from './_generated/api';
import {
  getCurrentSemester,
  getCurrentUser,
  getQueueEntry,
  getQueueLength,
  getTA,
} from './common';
import { Doc } from './_generated/dataModel';

export const freezeQueue = mutation({
  args: {},
  handler: async (ctx, args) => {
    const user_data = (await getCurrentUser(ctx))!;

    if (user_data.kind !== 'TA') {
      throw new ConvexError('User is not a TA');
    }

    const globalSettings = (await ctx.db.query('globalSettings').first())!;

    await ctx.db.patch(globalSettings._id, {
      is_frozen: true,
    });
  },
});

export const unfreezeQueue = mutation({
  args: {},
  handler: async (ctx, args) => {
    const user_data = (await getCurrentUser(ctx))!;

    if (user_data.kind !== 'TA') {
      throw new ConvexError('User is not a TA');
    }

    const globalSettings = (await ctx.db.query('globalSettings').first())!;

    await ctx.db.patch(globalSettings._id, {
      is_frozen: false,
    });
  },
});

export const createAnnouncement = mutation({
  args: {
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const user_data = (await getCurrentUser(ctx))!;

    if (user_data.kind !== 'TA') {
      throw new ConvexError('User is not a TA');
    }

    const globalSettings = (await ctx.db.query('globalSettings').first())!;

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
  handler: async (ctx, args) => {
    const user_data = (await getCurrentUser(ctx))!;

    if (user_data.kind !== 'TA') {
      throw new ConvexError('User is not a TA');
    }

    const globalSettings = (await ctx.db.query('globalSettings').first())!;

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
  handler: async (ctx, args) => {
    const user_data = (await getCurrentUser(ctx))!;

    if (user_data.kind !== 'TA') {
      throw new ConvexError('User is not a TA');
    }

    const globalSettings = (await ctx.db.query('globalSettings').first())!;

    const curr_announcements = globalSettings.announcements;
    curr_announcements.splice(args.idx, 1);

    await ctx.db.patch(globalSettings._id, {
      announcements: curr_announcements,
    });
  },
});

export const addQuestion = mutation({
  // TODO COME BACK EHRE
  args: {
    question: v.string(),
    location: v.string(),
    assignment_id: v.id('assignments'),
    overrideCooldown: v.boolean(),
    email: v.optional(v.string()), // only used for TA created questions
  },
  handler: async (ctx, args) => {
    const user_data = (await getCurrentUser(ctx))!;

    // Handle TA created questions
    if (user_data.kind == 'TA') {
      if (!args.email) {
        throw new ConvexError('TA created questions must have an email');
      }

      const existingUser = await ctx.db
        .query('users')
        .withIndex('email', (q) => q.eq('email', args.email))
        .first();

      let student: Doc<'students'> | null = null;

      if (!existingUser) {
        // create a new user
        let name = args.email.split('@')[0];
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
        student = await ctx.db
          .query('students')
          .withIndex('by_user', (q) => q.eq('user_id', existingUser._id))
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

      const queue_length = await getQueueLength(ctx);

      await ctx.db.insert('ohq', {
        student_id: student._id,
        created_by: 'TA',
        assignment_id: args.assignment_id,
        statuses: ['waiting'],
        question: args.question,
        location: args.location,
        entry_time_ms: Date.now(),
        messages_from_tas: [],
        position: queue_length,
        num_asked_to_fix: 0,
      });
    }
    // handle student created questions
    else {
      const student = (await ctx.db
        .query('students')
        .withIndex('by_user', (q) => q.eq('user_id', user_data._id))
        .first())!;

      const existing_entry = await getQueueEntry(ctx, student._id);

      if (existing_entry) {
        throw new ConvexError('Student already on the queue');
      }

      // check if student is allowed to ask questions
      const curr_sem = await getCurrentSemester(ctx);

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
      const globalSettings = (await ctx.db.query('globalSettings').first())!;

      // if override disabled, throw error
      if (args.overrideCooldown && !globalSettings.allow_cooldown_override) {
        throw new ConvexError('Cooldown override is disabled');
      }

      // if override enabled, check if they're allowed to override
      else if (args.overrideCooldown) {
        // check if they've asked a question in the last rejoin_time_ms
        const rejoin_time_ms = globalSettings.rejoin_time_ms;

        const lastQuestion = await ctx.db
          .query('questions')
          .withIndex('by_student_and_exit_time', (q) =>
            q.eq('student_id', student._id)
          )
          .order('desc')
          .first();

        if (lastQuestion) {
          if (lastQuestion.exit_time_ms > Date.now() - rejoin_time_ms) {
            throw new ConvexError({
              code: 'COOLDOWN_VIOLATION',
              rejoin_time_ms: rejoin_time_ms,
              waited_time_ms: Date.now() - lastQuestion.exit_time_ms,
            });
          }
        }
      }

      // enqueue student
      const queue_length = await getQueueLength(ctx);

      await ctx.db.insert('ohq', {
        student_id: student._id,
        created_by: 'student',
        assignment_id: args.assignment_id,
        statuses: ['waiting'],
        question: args.question,
        location: args.location,
        entry_time_ms: Date.now(),
        messages_from_tas: [],
        position: queue_length,
        num_asked_to_fix: 0,
      });
    }
  },
});

// Remove student, write to database
export const removeStudent = mutation({
  args: {
    student_id: v.id('students'),
    reason: v.union(v.literal('helped'), v.literal('removed')),
  },
  handler: async (ctx, args) => {
    const user_data = (await getCurrentUser(ctx))!;
    const student_to_remove = (await ctx.db.get(args.student_id))!;

    // must be a TA
    if (user_data.kind !== 'TA') {
      throw new ConvexError('User must be a TA to finish helping');
    }

    // must be same TA that was helping the student
    const ta = (await getTA(ctx, user_data.sem_user_id))!;

    const existing_entry = (await getQueueEntry(ctx, student_to_remove._id))!;

    if (existing_entry.helping_ta_id !== ta._id) {
      throw new ConvexError('TA is not helping this student');
    }

    // remove from OHQ
    await ctx.runMutation(internal.common.removeQueueEntry, {
      queue_entry_id: existing_entry._id,
    });

    // add question to database
    const curr_sem = await getCurrentSemester(ctx);

    await ctx.db.insert('questions', {
      semester_id: curr_sem._id,
      assignment_id: existing_entry.assignment_id,
      student_id: student_to_remove._id,
      ta_id: ta._id,

      question: existing_entry.question,
      location: existing_entry.location,

      created_by: existing_entry.created_by,
      finished_by: args.reason,

      entry_time_ms: existing_entry.entry_time_ms,
      exit_time_ms: Date.now(),
      help_time_ms: Date.now() - existing_entry.help_start_time_ms!,

      num_asked_to_fix: existing_entry.num_asked_to_fix,
    });
  },
});

export const helpStudent = mutation({
  args: {
    student_id: v.id('students'),
  },
  handler: async (ctx, args) => {
    const user_data = (await getCurrentUser(ctx))!;
    const student_to_help = (await ctx.db.get(args.student_id))!;

    // must be a TA
    if (user_data.kind !== 'TA') {
      throw new ConvexError('User must be a TA to help');
    }

    const existing_entry = (await getQueueEntry(ctx, student_to_help._id))!;

    if (
      existing_entry.helping_ta_id !== undefined ||
      existing_entry.statuses.includes('being_helped')
    ) {
      throw new ConvexError('Student is already being helped');
    }

    const ta = (await getTA(ctx, user_data.sem_user_id))!;

    let new_statuses = [...existing_entry.statuses, 'being_helped'];
    new_statuses.filter(
      (status) => !['waiting', 'fixing_question', 'frozen'].includes(status)
    );

    await ctx.db.patch(existing_entry._id, {
      helping_ta_id: ta._id,
      statuses: new_statuses as (
        | 'being_helped'
        | 'waiting'
        | 'fixing_question'
        | 'frozen'
        | 'cooldown_violation'
        | 'received_message'
        | 'error'
      )[],
      help_start_time_ms: Date.now(),
    });
  },
});

export const unhelpStudent = mutation({
  args: {
    student_id: v.id('students'),
  },
  handler: async (ctx, args) => {
    const user_data = (await getCurrentUser(ctx))!;
    const student_to_unhelp = (await ctx.db.get(args.student_id))!;

    // must be a TA
    if (user_data.kind !== 'TA') {
      throw new ConvexError('User must be a TA to unhelp');
    }

    const existing_entry = (await getQueueEntry(ctx, student_to_unhelp._id))!;

    const ta = (await getTA(ctx, user_data.sem_user_id))!;

    if (existing_entry.helping_ta_id !== ta._id) {
      throw new ConvexError('TA is not helping this student');
    }

    // TODO COME BACK HERE - don't actually like the idea of array of statuses
    await ctx.db.patch(existing_entry._id, {
      helping_ta_id: undefined,
      statuses: existing_entry.statuses.filter(
        (status) => status !== 'being_helped'
      ),
      help_start_time_ms: undefined,
    });
  },
});
