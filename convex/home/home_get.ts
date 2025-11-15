import { query, QueryCtx } from "../_generated/server";
import { ConvexError, v } from "convex/values";
import { Doc } from "../_generated/dataModel";
import {
  getCurrentSemester,
  getCurrentUser,
  getGlobalSettings,
  getQueueEntry,
  getQueueLength,
  getNumUnhelped,
  getMinsPerStudent,
  getNumTAs,
  getStudent,
  getTA,
} from "../common";

export const getQueueData = query({
  args: {},
  handler: async (ctx, args) => {
    const globalSettings = await getGlobalSettings(ctx);

    const queue_length = await getQueueLength(ctx);
    const num_unhelped = await getNumUnhelped(ctx);
    const num_tas = await getNumTAs(ctx);
    const mins_per_student = await getMinsPerStudent(ctx);

    const current_day_of_week = new Date().getDay();
    const current_locations =
      globalSettings.day_to_location_dict[current_day_of_week];

    return {
      title: globalSettings.course_name,
      is_frozen: globalSettings.is_frozen,
      announcements: globalSettings.announcements,
      // TODO CONVEX MAKE SURE "
      current_locations: current_locations,

      allow_cooldown_override: globalSettings.allow_cooldown_override,
      allow_tas_show_others_timer: globalSettings.allow_tas_show_others_timer,
      rejoin_time_ms: globalSettings.rejoin_time_ms,

      num_students: queue_length,

      questions_policy_url: globalSettings.questions_policy_url,

      num_unhelped: num_unhelped,
      num_tas: num_tas,
      mins_per_student: mins_per_student,
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

    const is_owner = curr_sem.owner_emails.includes(user_data._id);

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

    let student_data: Doc<"ohq"> | null = null;
    let ta_data: TAData = null;

    if (user_data.kind === "TA") {
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
    } else if (user_data.kind === "student") {
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
      .query("ohq")
      .withIndex("by_position")
      .order("asc")
      .collect();
  },
});

export const getCurrentAssignments = query({
  args: {},
  handler: async (ctx, args) => {
    const curr_sem = await getCurrentSemester(ctx);

    const curr_date = new Date().getTime();

    // CONVEX TODO ADD OTHER ASSIGNMENT TO ALL SEMESTERS
    // if "other" assignment doesn't exist, make it
    // const other_assignment = await ctx.db
    //   .query("assignments")
    //   .withIndex("by_sem_name", (x) =>
    //     x.eq("semester_id", curr_sem._id).eq("name", "other"),
    //   )
    //   .first();

    // if (!other_assignment) {
    //   await ctx.db.insert("assignments", {
    //     semester_id: curr_sem._id,
    //     name: "other",
    //     start_date_ms: 0,
    //     end_date_ms: Number.MAX_SAFE_INTEGER,
    //   });
    // }

    const all_assignments = await ctx.db
      .query("assignments")
      .withIndex("by_sem_end", (x) =>
        x.eq("semester_id", curr_sem._id).gt("end_date_ms", curr_date),
      )
      .filter((x) => x.lt(x.field("start_date_ms"), curr_date))
      .collect();

    return all_assignments;
  },
});
