import { convexToJson, v } from 'convex/values';
import { query } from './_generated/server';
import { ensureAuthAndStudent, ensureAuthAndTA, getQueueEntry } from './common';

// notifs work by returning a boolean that changes from false -> true

export const helpNotif = query({
  args: {},
  returns: v.object({
    value: v.boolean(),
    messageTitle: v.string(),
    messageBody: v.string(),
  }),
  handler: async (ctx, args) => {
    // check if student on queue and status is "being helped"
    const student = await ensureAuthAndStudent(ctx);

    const queue_entry = await getQueueEntry(ctx, student.student._id);

    if (queue_entry) {
      const being_helped = queue_entry.status === 'being_helped';
      if (being_helped) {
        return {
          value: true,
          messageTitle: "It's your turn to get help!",
          messageBody: `${queue_entry.helping_ta?.preferred_name} is ready to help you`,
        };
      }
    }

    return {
      value: false,
      messageTitle: '',
      messageBody: '',
    };
  },
});

export const updateQRequestNotif = query({
  args: {},
  returns: v.object({
    value: v.boolean(),
    messageTitle: v.string(),
    messageBody: v.string(),
  }),
  handler: async (ctx, args) => {
    // check if student on queue and status is "being helped"
    const student = await ensureAuthAndStudent(ctx);

    const queue_entry = await getQueueEntry(ctx, student.student._id);

    if (queue_entry) {
      const ask_to_fix = queue_entry.status === 'fixing_question';
      if (ask_to_fix) {
        return {
          value: true,
          messageTitle: 'Please update your question',
          messageBody: ``,
        };
      }
    }

    return {
      value: false,
      messageTitle: '',
      messageBody: '',
    };
  },
});

// This handler should notify AFTER a cooldown violation, so we set it to return true normally and false during a cooldown violation
export const approveCooldownNotif = query({
  args: {},
  returns: v.object({
    value: v.boolean(),
    messageTitle: v.string(),
    messageBody: v.string(),
  }),
  handler: async (ctx, args) => {
    // check if student on queue and status is "being helped"
    const student = await ensureAuthAndStudent(ctx);

    const queue_entry = await getQueueEntry(ctx, student.student._id);

    if (queue_entry) {
      const cooldown_violation = queue_entry.status === 'cooldown_violation';
      if (cooldown_violation) {
        return {
          value: false,
          messageTitle: 'Please update your question',
          messageBody: ``,
        };
      }
    }

    return {
      value: true,
      messageTitle: '',
      messageBody: '',
    };
  },
});

export const receivedMessageNotif = query({
  args: {},
  returns: v.object({
    value: v.boolean(),
    messageTitle: v.string(),
    messageBody: v.string(),
  }),
  handler: async (ctx, args) => {
    // check if student on queue and status is "being helped"
    const student = await ensureAuthAndStudent(ctx);

    const queue_entry = await getQueueEntry(ctx, student.student._id);

    if (queue_entry) {
      const has_unread_messages = queue_entry.has_unread_messages;
      if (has_unread_messages) {
        return {
          value: true,
          messageTitle: "You've been messaged by a TA",
          messageBody: ``,
        };
      }
    }

    return {
      value: false,
      messageTitle: '',
      messageBody: '',
    };
  },
});

export const removedNotif = query({
  args: {},
  returns: v.object({
    value: v.boolean(),
    messageTitle: v.string(),
    messageBody: v.string(),
  }),
  handler: async (ctx, args) => {
    // check if student on queue and status is "being helped"
    const student = await ensureAuthAndStudent(ctx);

    const now = new Date().getTime();
    const one_second_ago = now - 1000;

    const finished_question = await ctx.db
      .query('questions')
      .withIndex('by_student_and_exit_time', (q) =>
        q
          .eq('student_id', student.student._id)
          .gte('exit_time_ms', one_second_ago)
      )
      .first();

    if (finished_question) {
      const was_removed = finished_question.finished_by === 'removed';
      if (was_removed) {
        return {
          value: true,
          messageTitle: "You've been removed from the queue",
          messageBody: ``,
        };
      }
    }

    return {
      value: false,
      messageTitle: '',
      messageBody: '',
    };
  },
});

// export const youAreHelpingTestNotif = query({
//   args: {},
//   returns: v.object({
//     value: v.boolean(),
//     messageTitle: v.string(),
//     messageBody: v.string(),
//   }),
//   handler: async (ctx, args) => {
//     // check if student on queue and status is "being helped"
//     const ta = await ensureAuthAndTA(ctx);

//     const all_entries = await ctx.db.query('ohq').collect();

//     let is_helping = false;
//     let is_helping_who = null;

//     for (const entry of all_entries) {
//       if (
//         entry.status === 'being_helped' &&
//         entry.helping_ta!.ta_id === ta.ta._id
//       ) {
//         is_helping = true;
//         is_helping_who = entry;
//       }
//     }

//     if (is_helping) {
//       return {
//         value: true,
//         messageTitle: 'You are now helping!',
//         messageBody: `You started helping ${is_helping_who?.student_name}`,
//       };
//     }

//     return {
//       value: false,
//       messageTitle: '',
//       messageBody: '',
//     };
//   },
// });
