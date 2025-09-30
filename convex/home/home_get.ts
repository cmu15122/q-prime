import { query, QueryCtx } from '../_generated/server';
import { ConvexError, v } from 'convex/values';
import { Doc } from '../_generated/dataModel';
import { getCurrentSemester, getCurrentUser, getQueueLength } from '../common';

export const getQueueStatus = query({
  args: {},
  handler: async (ctx, args) => {
    const globalSettings = (await ctx.db.query('globalSettings').first())!;

    const queue_length = await getQueueLength(ctx);

    const current_day_of_week = new Date().getDay();
    const current_locations =
      globalSettings.day_to_location_dict[current_day_of_week];

    return {
      title: globalSettings.course_name,
      is_frozen: globalSettings.is_frozen,
      announcements: globalSettings.announcements,
      current_locations: current_locations,

      allow_cooldown_override: globalSettings.allow_cooldown_override,
      allow_tas_show_others_timer: globalSettings.allow_tas_show_others_timer,
      rejoin_time_ms: globalSettings.rejoin_time_ms,

      num_students: queue_length,

      questions_policy_url: globalSettings.questions_policy_url,

      // TODO WAIT TIMES DATA
    };
  },
});

async function addTADataToQueueEntry(ctx: QueryCtx, x: Doc<'ohq'> | null) {
  if (!x) {
    return null;
  }

  let res = {
    ...x,
    ta_data: null,
  };

  if (x.helping_ta_id) {
    const ta = (await ctx.db.get(x.helping_ta_id))!;
    const ta_prefs = (await ctx.db.get(ta.user_prefs_id))!;

    return {
      ...res,
      ta_data: {
        pref_name: ta_prefs.preferred_name,
        zoom_enabled: ta.zoom_enabled,
        zoom_url: ta.zoom_url,
      },
    };
  } else {
    return res;
  }
}

export const getUserData = query({
  args: {},
  handler: async (ctx, args) => {
    const curr_sem = await getCurrentSemester(ctx);
    const user_data = await getCurrentUser(ctx);

    if (!user_data) {
      return null;
    }

    const is_owner = curr_sem.owners.includes(user_data._id);

    let student_data = null;
    let ta_data = null;

    if (user_data.kind === 'TA') {
      const ta = (await ctx.db
        .query('tas')
        .withIndex('by_semuser', (q) =>
          q.eq('semester_user_id', user_data.sem_user_id)
        )
        .first())!;

      ta_data = {
        ta_id: ta._id,
        is_admin: ta.is_admin,
        zoom_enabled: ta.zoom_enabled,
        zoom_url: ta.zoom_url,
        join_notifs_enabled: ta.join_notifs_enabled,
        remind_notifs_enabled: ta.remind_notifs_enabled,
        remind_time_mins: ta.remind_time_mins,
        show_self_timer: ta.show_self_timer,
        show_others_timer: ta.show_others_timer,
      };
    } else if (user_data.kind === 'student') {
      const student = (await ctx.db
        .query('students')
        .withIndex('by_semuser', (q) =>
          q.eq('semester_user_id', user_data.sem_user_id)
        )
        .first())!;

      const queue_entry = await ctx.db
        .query('ohq')
        .withIndex('by_student', (q) => q.eq('student_id', student._id))
        .first();

      const queue_entry_with_ta_data = await addTADataToQueueEntry(
        ctx,
        queue_entry
      );

      student_data = {
        student_id: student._id,
        queue_entry: queue_entry_with_ta_data,
      };
    }

    return {
      user_id: user_data._id,
      sem_user_id: user_data.sem_user_id,
      is_owner: is_owner,
      preferred_name: user_data.preferred_name,
      user_kind: user_data.kind,
      ta_data: ta_data,
      student_data: student_data,
    };
  },
});

export const getAllStudents = query({
  args: {},
  handler: async (ctx, args) => {
    const ohq = await ctx.db
      .query('ohq')
      .withIndex('by_position')
      .order('asc')
      .collect();

    const ohq_with_ta_data = await Promise.all(
      ohq.map(async (x) => addTADataToQueueEntry(ctx, x))
    );

    return ohq_with_ta_data;
  },
});
