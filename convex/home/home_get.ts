import { query, QueryCtx } from '../_generated/server';
import { ConvexError, v } from 'convex/values';
import { Doc } from '../_generated/dataModel';
import {
  getCurrentSemester,
  getCurrentUser,
  getGlobalSettings,
  getQueueEntry,
  getQueueLength,
  getWaittimeData,
  getStudent,
  getTA,
} from '../common';
import { getAuthUserId } from '@convex-dev/auth/server';

export const getQueueData = query({
  args: {},
  handler: async (ctx, args) => {
    const globalSettings = await getGlobalSettings(ctx);

    const queue_length = await getQueueLength(ctx);
    const wait_time_data = await getWaittimeData(ctx);

    const current_day_of_week = new Date().getDay();
    const current_locations =
      globalSettings.day_to_location_dict[current_day_of_week] || [];

    return {
      title: globalSettings.course_name,
      is_frozen: globalSettings.is_frozen,
      announcements: globalSettings.announcements,
      allowed_email_domains: globalSettings.allowed_email_domains,
      current_locations: current_locations,

      allow_cooldown_override: globalSettings.allow_cooldown_override,
      allow_tas_show_others_timer: globalSettings.allow_tas_show_others_timer,
      rejoin_time_ms: globalSettings.rejoin_time_ms,

      num_students: queue_length,

      questions_policy_url: globalSettings.questions_policy_url,

      num_unhelped: wait_time_data.num_unhelped,
      num_tas: wait_time_data.num_tas,
      mins_per_student: wait_time_data.mins_per_student,
    };
  },
});

export const getUserData = query({
  args: {},
  handler: async (ctx, args) => {
    const curr_sem = await getCurrentSemester(ctx);
    const user_data = await getCurrentUser(ctx);

    if (!user_data) {
      return null;
    }

    const is_owner = curr_sem.owner_emails.includes(user_data.email!);

    type TAData = {
      ta_id: string;
      is_admin: boolean;
      zoom_enabled: boolean;
      zoom_url: string | undefined;
      join_notifs_enabled: boolean;
      remind_notifs_enabled: boolean;
      remind_time_mins: number;
      show_self_timer: boolean;
      show_others_timer: boolean;
    } | null;

    let student_data: Doc<'ohq'> | null = null;
    let ta_data: TAData = null;

    if (user_data.kind === 'TA') {
      const ta = await getTA(ctx, user_data.sem_user_id);

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
      const student = await getStudent(ctx, user_data.sem_user_id);

      student_data = await getQueueEntry(ctx, student._id);
    }

    return {
      user_id: user_data._id,
      email: user_data.email!,
      sem_user_id: user_data.sem_user_id,
      is_owner: is_owner,
      preferred_name: user_data.preferred_name,
      user_kind: user_data.kind,
      ta_data: ta_data as typeof ta_data | null,
      student_data: student_data as typeof student_data | null,
    };
  },
});

export const getAllStudents = query({
  args: {},
  handler: async (ctx, args) => {
    return await ctx.db
      .query('ohq')
      .withIndex('by_position')
      .order('asc')
      .collect();
  },
});

export const getAllAssignments = query({
  args: {},
  handler: async (ctx, args) => {
    const curr_sem = await getCurrentSemester(ctx);

    const other_assignment_id = curr_sem.other_assignment!;

    const all_assignments = await ctx.db
      .query('assignments')
      .withIndex('by_sem_end', (x) => x.eq('semester_id', curr_sem._id))
      .collect();

    return {
      all_assignments: all_assignments,
      other_assignment_id: other_assignment_id,
    }
  },
});

export const getCurrentAssignments = query({
  args: {},
  handler: async (ctx, args) => {
    const curr_sem = await getCurrentSemester(ctx);

    const curr_date = new Date().getTime();

    const curr_assignments = await ctx.db
      .query('assignments')
      .withIndex('by_sem_end', (x) =>
        x.eq('semester_id', curr_sem._id).gt('end_date_ms', curr_date)
      )
      .filter((x) => x.lt(x.field('start_date_ms'), curr_date))
      .collect();

    const other_assignment = (await ctx.db.get(curr_sem.other_assignment!))!;

    return [...curr_assignments, other_assignment];
  },
});

export const checkValidEmail = query({
  args: {},
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const user_id = await getAuthUserId(ctx);

    if (user_id) {
      const user = await ctx.db.get(user_id);

      if (!user || !user.email) {
        return false;
      }

      const email = user.email;
      const global_settings = await getGlobalSettings(ctx);

      if (global_settings.enforce_email_domain) {
        const allowed_domains = global_settings.allowed_email_domains;
        const user_domain = email.split('@')[1];

        if (!allowed_domains.includes(user_domain)) {
          return false;
        }
      }
    }

    return true;
  },
});

export const getNotif = query({
  args: {},
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    if (!user) {
      return null;
    }

    const semuser = await ctx.db.get(user?.sem_user_id);

    if (!semuser) {
      return null;
    }

    return semuser.notification;
  },
});
