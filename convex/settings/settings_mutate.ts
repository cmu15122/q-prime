import { ConvexError, v } from 'convex/values';
import { DateTime } from 'luxon';
import { mutation } from '../_generated/server';
import {
  ensureAuthAndAdmin,
  ensureAuthAndOwner,
  ensureAuthAndTA,
  getAssignmentInCourse,
  getCurrentSemester,
  getCurrentUser,
  getGlobalSettings,
  getQueueLength,
} from '../common';
import { Id } from '../_generated/dataModel';

/** General Settings (User-specific) **/

export const updateVideoChat = mutation({
  args: {
    courseId: v.id('courses'),
    enabled: v.boolean(),
    url: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { ta } = await ensureAuthAndTA(ctx, args.courseId);

    await ctx.db.patch(ta._id, {
      zoom_enabled: args.enabled,
      zoom_url: args.url,
    });

    return null;
  },
});

export const updatePreferredName = mutation({
  args: {
    courseId: v.id('courses'),
    preferred_name: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user_data = (await getCurrentUser(ctx, args.courseId))!;

    const user_prefs = (await ctx.db
      .query('userPreferences')
      .withIndex('by_user_id', (q) => q.eq('user_id', user_data._id))
      .first())!;

    await ctx.db.patch(user_prefs._id, {
      preferred_name: args.preferred_name,
    });

    return null;
  },
});

export const updateNotifications = mutation({
  args: {
    courseId: v.id('courses'),
    joinEnabled: v.boolean(),
    remindEnabled: v.boolean(),
    remindTime: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { ta } = await ensureAuthAndTA(ctx, args.courseId);

    if (args.remindTime < 0) {
      throw new ConvexError('Remind time must be non-negative');
    }

    await ctx.db.patch(ta._id, {
      join_notifs_enabled: args.joinEnabled,
      remind_notifs_enabled: args.remindEnabled,
      remind_time_mins: args.remindTime,
    });

    return null;
  },
});

export const updateTimerSettings = mutation({
  args: {
    courseId: v.id('courses'),
    showSelfTimer: v.boolean(),
    showOthersTimer: v.boolean(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { ta } = await ensureAuthAndTA(ctx, args.courseId);

    await ctx.db.patch(ta._id, {
      show_self_timer: args.showSelfTimer,
      show_others_timer: args.showOthersTimer,
    });

    return null;
  },
});

/** Admin Functions - Config Settings **/

export const updateCourseName = mutation({
  args: {
    courseId: v.id('courses'),
    courseName: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ensureAuthAndAdmin(ctx, args.courseId);

    if (!args.courseName) {
      throw new ConvexError('Course name cannot be empty');
    }

    const globalSettings = await getGlobalSettings(ctx, args.courseId);

    await ctx.db.patch(globalSettings._id, {
      course_name: args.courseName,
    });

    return null;
  },
});

export const updateQuestionsURL = mutation({
  args: {
    courseId: v.id('courses'),
    questionsURL: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ensureAuthAndAdmin(ctx, args.courseId);

    if (!args.questionsURL) {
      throw new ConvexError('Questions URL cannot be empty');
    }

    const globalSettings = await getGlobalSettings(ctx, args.courseId);

    await ctx.db.patch(globalSettings._id, {
      questions_policy_url: args.questionsURL,
    });

    return null;
  },
});

export const updateRejoinTime = mutation({
  args: {
    courseId: v.id('courses'),
    rejoinTime: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ensureAuthAndAdmin(ctx, args.courseId);

    if (isNaN(args.rejoinTime) || args.rejoinTime < 0) {
      throw new ConvexError('Rejoin time must be a non-negative number');
    }

    const globalSettings = await getGlobalSettings(ctx, args.courseId);

    await ctx.db.patch(globalSettings._id, {
      rejoin_time_ms: args.rejoinTime * 60000, // convert minutes to ms
    });

    return null;
  },
});

export const updateEnforceEmailDomain = mutation({
  args: {
    courseId: v.id('courses'),
    enforceEmailDomain: v.boolean(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ensureAuthAndAdmin(ctx, args.courseId);

    const globalSettings = await getGlobalSettings(ctx, args.courseId);

    await ctx.db.patch(globalSettings._id, {
      enforce_email_domain: args.enforceEmailDomain,
    });

    return null;
  },
});

export const updateAllowedEmailDomains = mutation({
  args: {
    courseId: v.id('courses'),
    allowedEmailDomains: v.array(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ensureAuthAndAdmin(ctx, args.courseId);

    const globalSettings = await getGlobalSettings(ctx, args.courseId);

    await ctx.db.patch(globalSettings._id, {
      allowed_email_domains: args.allowedEmailDomains,
    });

    return null;
  },
});

export const updateAllowCooldownOverride = mutation({
  args: {
    courseId: v.id('courses'),
    allowCDOverride: v.boolean(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ensureAuthAndAdmin(ctx, args.courseId);

    const globalSettings = await getGlobalSettings(ctx, args.courseId);

    await ctx.db.patch(globalSettings._id, {
      allow_cooldown_override: args.allowCDOverride,
    });

    return null;
  },
});

export const updateAllowShowOthersTimer = mutation({
  args: {
    courseId: v.id('courses'),
    allowShowOthersTimer: v.boolean(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ensureAuthAndAdmin(ctx, args.courseId);

    const globalSettings = await getGlobalSettings(ctx, args.courseId);

    await ctx.db.patch(globalSettings._id, {
      allow_tas_show_others_timer: args.allowShowOthersTimer,
    });

    return null;
  },
});

export const updateTimezone = mutation({
  args: {
    courseId: v.id('courses'),
    timezone: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ensureAuthAndAdmin(ctx, args.courseId);

    const trimmedTimezone = args.timezone.trim();
    if (!trimmedTimezone) {
      throw new ConvexError('Timezone cannot be empty');
    }
    const dt = DateTime.now().setZone(trimmedTimezone);
    if (!dt.isValid) {
      throw new ConvexError('Invalid timezone for Luxon');
    }

    const globalSettings = await getGlobalSettings(ctx, args.courseId);

    await ctx.db.patch(globalSettings._id, {
      timezone: trimmedTimezone,
    });

    return null;
  },
});

/** Assignment Functions **/

export const createAssignment = mutation({
  args: {
    courseId: v.id('courses'),
    name: v.string(),
    assignment_type: v.optional(v.string()),
    start_date_ms: v.number(),
    end_date_ms: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ensureAuthAndAdmin(ctx, args.courseId);

    const curr_sem = await getCurrentSemester(ctx, args.courseId);

    await ctx.db.insert('assignments', {
      name: args.name,
      semester_id: curr_sem._id,
      assignment_type: args.assignment_type,
      start_date_ms: args.start_date_ms,
      end_date_ms: args.end_date_ms,
    });

    return null;
  },
});

export const updateAssignment = mutation({
  args: {
    courseId: v.id('courses'),
    assignment_id: v.id('assignments'),
    name: v.string(),
    assignment_type: v.optional(v.string()),
    start_date_ms: v.number(),
    end_date_ms: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ensureAuthAndAdmin(ctx, args.courseId);

    await getAssignmentInCourse(ctx, args.courseId, args.assignment_id);

    await ctx.db.patch(args.assignment_id, {
      name: args.name,
      assignment_type: args.assignment_type,
      start_date_ms: args.start_date_ms,
      end_date_ms: args.end_date_ms,
    });

    return null;
  },
});

export const deleteAssignment = mutation({
  args: {
    courseId: v.id('courses'),
    assignment_id: v.id('assignments'),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ensureAuthAndAdmin(ctx, args.courseId);

    await getAssignmentInCourse(ctx, args.courseId, args.assignment_id);

    await ctx.db.delete(args.assignment_id);

    return null;
  },
});

/** Location Functions **/

export const addLocation = mutation({
  args: {
    courseId: v.id('courses'),
    room: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ensureAuthAndAdmin(ctx, args.courseId);

    if (!args.room) {
      throw new ConvexError('Room name cannot be empty');
    }

    const globalSettings = await getGlobalSettings(ctx, args.courseId);

    const dayDictionary = { ...globalSettings.day_to_location_dict };

    if (!dayDictionary['-1']) {
      dayDictionary['-1'] = [];
    }

    dayDictionary['-1'].push(args.room);

    await ctx.db.patch(globalSettings._id, {
      day_to_location_dict: dayDictionary,
    });

    return null;
  },
});

export const updateLocations = mutation({
  args: {
    courseId: v.id('courses'),
    room: v.string(), // string room name
    days: v.array(v.string()), // array of day names for this room
    daysOfWeek: v.record(v.string(), v.number()), // dictionary of day names to day indices
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ensureAuthAndAdmin(ctx, args.courseId);

    const globalSettings = await getGlobalSettings(ctx, args.courseId);

    const newDayDictionary = { ...globalSettings.day_to_location_dict };

    for (const day in args.daysOfWeek) {
      const dayIndex = args.daysOfWeek[day];
      const currRoomForDay = newDayDictionary[dayIndex];

      if (args.days.includes(day)) {
        // day is selected for room
        if (!currRoomForDay) {
          newDayDictionary[dayIndex] = [args.room];
        } else if (!currRoomForDay.includes(args.room)) {
          newDayDictionary[dayIndex] = [...currRoomForDay, args.room];
        }
      } else {
        // day is NOT selected for room
        if (currRoomForDay && currRoomForDay.includes(args.room)) {
          newDayDictionary[dayIndex] = currRoomForDay.filter((r) => r !== args.room);
        }
      }
    }

    await ctx.db.patch(globalSettings._id, {
      day_to_location_dict: newDayDictionary,
    });

    return null;
  },
});

export const removeLocation = mutation({
  args: {
    courseId: v.id('courses'),
    room: v.string(),
    days: v.array(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ensureAuthAndAdmin(ctx, args.courseId);
    const globalSettings = await getGlobalSettings(ctx, args.courseId);
    const dayDictionary = { ...globalSettings.day_to_location_dict };

    for (const dayInt of args.days) {
      const key = dayInt.toString();
      if (dayDictionary[key]) {
        dayDictionary[key] = dayDictionary[key].filter((r) => r !== args.room);
      }
    }

    // Remove from -1 (all rooms list)
    if (dayDictionary['-1']) {
      dayDictionary['-1'] = dayDictionary['-1'].filter((r) => r !== args.room);
    }

    await ctx.db.patch(globalSettings._id, {
      day_to_location_dict: dayDictionary,
    });

    return null;
  },
});

/** Access Control Functions **/

export const updateWhitelistSettings = mutation({
  args: {
    courseId: v.id('courses'),
    enableWhitelist: v.boolean(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ensureAuthAndAdmin(ctx, args.courseId);

    const curr_sem = await getCurrentSemester(ctx, args.courseId);

    await ctx.db.patch(curr_sem._id, {
      enable_whitelist: args.enableWhitelist,
    });

    return null;
  },
});

export const updateBlacklistSettings = mutation({
  args: {
    courseId: v.id('courses'),
    enableBlacklist: v.boolean(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ensureAuthAndAdmin(ctx, args.courseId);

    const curr_sem = await getCurrentSemester(ctx, args.courseId);

    await ctx.db.patch(curr_sem._id, {
      enable_blacklist: args.enableBlacklist,
    });

    return null;
  },
});

export const updateAccessControlledUser = mutation({
  args: {
    courseId: v.id('courses'),
    email: v.string(),
    is_whitelisted: v.boolean(),
    is_blacklisted: v.boolean(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ensureAuthAndAdmin(ctx, args.courseId);

    const curr_sem = await getCurrentSemester(ctx, args.courseId);

    if (args.is_blacklisted && args.is_whitelisted) {
      throw new ConvexError('User cannot be both blacklisted and whitelisted');
    }

    if (args.is_whitelisted) {
      // Add to whitelist if not already there
      if (!curr_sem.whitelist.includes(args.email)) {
        await ctx.db.patch(curr_sem._id, {
          whitelist: [...curr_sem.whitelist, args.email],
        });
      }
    } else {
      // Remove from whitelist if they're on it
      await ctx.db.patch(curr_sem._id, {
        whitelist: curr_sem.whitelist.filter((email) => email !== args.email),
      });
    }

    if (args.is_blacklisted) {
      // Add to blacklist if not already there
      if (!curr_sem.blacklist.includes(args.email)) {
        await ctx.db.patch(curr_sem._id, {
          blacklist: [...curr_sem.blacklist, args.email],
        });
      }
    } else {
      // Remove from blacklist if they're on it
      await ctx.db.patch(curr_sem._id, {
        blacklist: curr_sem.blacklist.filter((email) => email !== args.email),
      });
    }

    return null;
  },
});

/** TA Functions **/
// Note: These functions are not fully implemented because they require careful
// handling of user creation flows and cross-table updates that need more context
// about the authentication system and user lifecycle management.

export const createTA = mutation({
  args: {
    courseId: v.id('courses'),
    name: v.string(),
    email: v.string(),
    isAdmin: v.boolean(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    try {
      await ensureAuthAndAdmin(ctx, args.courseId);
    } catch (error) {
      await ensureAuthAndOwner(ctx, args.courseId);
    }

    const user = await ctx.db
      .query('users')
      .withIndex('email', (x) => x.eq('email', args.email))
      .first();

    const curr_sem = await getCurrentSemester(ctx, args.courseId);
    // if a user already exists, link to that user
    if (user != null) {
      // if they don't have a sem user yet, make one
      const curr_sem_user = await ctx.db
        .query('semesterUsers')
        .withIndex('by_sem_and_user', (q) =>
          q.eq('semester_id', curr_sem._id).eq('user_id', user._id),
        )
        .first();

      let curr_sem_user_id: Id<'semesterUsers'> | null = null;
      let user_prefs_id: Id<'userPreferences'> | null = null;

      if (curr_sem_user == null) {
        const user_prefs = await ctx.db
          .query('userPreferences')
          .withIndex('by_user_id', (q) => q.eq('user_id', user._id))
          .first();

        if (!user_prefs) {
          throw new ConvexError('User preferences not found when creating semester user');
        }

        user_prefs_id = user_prefs._id;

        curr_sem_user_id = await ctx.db.insert('semesterUsers', {
          user_id: user._id,
          user_prefs_id: user_prefs._id,
          semester_id: curr_sem._id,
          kind: 'TA',
          notification: {
            title: '',
            body: '',
            timestamp: 0,
          },
        });
      } else {
        // make the sem user a TA
        await ctx.db.patch(curr_sem_user._id, {
          kind: 'TA',
        });

        curr_sem_user_id = curr_sem_user._id;
        user_prefs_id = curr_sem_user.user_prefs_id;
      }

      // Now make a TA entry if it doesn't exist already
      const existing_ta = await ctx.db
        .query('tas')
        .withIndex('by_semuser', (x) => x.eq('semester_user_id', curr_sem_user_id))
        .first();

      if (existing_ta) {
        console.warn('TA already exists', args.email);
      } else {
        await ctx.db.insert('tas', {
          user_id: user._id,
          user_prefs_id: user_prefs_id,
          semester_user_id: curr_sem_user_id,
          is_admin: args.isAdmin,
          zoom_enabled: false,
          zoom_url: '',
          join_notifs_enabled: false,
          remind_notifs_enabled: false,
          remind_time_mins: 10,
          show_self_timer: false,
          show_others_timer: false,
          num_helped: 0,
          time_helped_ms: 0,
        });
      }
    }
    // otherwise log that we want to make this TA when the user logs in
    else {
      const existing_future_ta = await ctx.db
        .query('future_tas')
        .withIndex('by_sem_and_email', (x) =>
          x.eq('semester_id', curr_sem._id).eq('email', args.email),
        )
        .first();

      if (existing_future_ta) {
        throw new ConvexError('Future TA already exists');
      }

      await ctx.db.insert('future_tas', {
        semester_id: curr_sem._id,
        email: args.email,
        name: args.name,
        is_admin: args.isAdmin,
      });
    }
  },
});

/**
 * Can only update whether a TA is an admin or not
 */
export const updateTA = mutation({
  args: {
    courseId: v.id('courses'),
    email: v.string(),
    isAdmin: v.boolean(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    try {
      await ensureAuthAndAdmin(ctx, args.courseId);
    } catch (error) {
      await ensureAuthAndOwner(ctx, args.courseId);
    }

    // check if the ta object exists
    const user = await ctx.db
      .query('users')
      .withIndex('email', (x) => x.eq('email', args.email))
      .first();

    const curr_sem = await getCurrentSemester(ctx, args.courseId);

    if (!user) {
      // check in future_tas
      const future_ta = await ctx.db
        .query('future_tas')
        .withIndex('by_sem_and_email', (x) =>
          x.eq('semester_id', curr_sem._id).eq('email', args.email),
        )
        .first();

      if (!future_ta) {
        throw new ConvexError('User does not exist in the current or future semesters');
      }

      await ctx.db.patch(future_ta._id, {
        is_admin: args.isAdmin,
      });
    } else {
      const sem_user = await ctx.db
        .query('semesterUsers')
        .withIndex('by_sem_and_user', (x) =>
          x.eq('semester_id', curr_sem._id).eq('user_id', user._id),
        )
        .first();

      if (!sem_user) {
        throw new ConvexError('TA user exists but does not have a sem_user entry');
      }

      const ta = await ctx.db
        .query('tas')
        .withIndex('by_semuser', (x) => x.eq('semester_user_id', sem_user._id))
        .first();

      if (!ta) {
        throw new ConvexError('TA user exists but does not have a ta entry');
      }

      await ctx.db.patch(ta._id, {
        is_admin: args.isAdmin,
      });
    }
  },
});

/**
 * Removes TA entry for a user with this email
 */
export const deleteTA = mutation({
  args: {
    courseId: v.id('courses'),
    email: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    try {
      await ensureAuthAndAdmin(ctx, args.courseId);
    } catch (error) {
      await ensureAuthAndOwner(ctx, args.courseId);
    }

    const user = await ctx.db
      .query('users')
      .withIndex('email', (x) => x.eq('email', args.email))
      .first();

    const curr_sem = await getCurrentSemester(ctx, args.courseId);

    if (!user) {
      // check in future_tas
      const future_ta = await ctx.db
        .query('future_tas')
        .withIndex('by_sem_and_email', (x) =>
          x.eq('semester_id', curr_sem._id).eq('email', args.email),
        )
        .first();

      if (!future_ta) {
        throw new ConvexError('User does not exist in the current or future semesters');
      }

      await ctx.db.delete(future_ta._id);
    } else {
      const sem_user = await ctx.db
        .query('semesterUsers')
        .withIndex('by_sem_and_user', (x) =>
          x.eq('semester_id', curr_sem._id).eq('user_id', user._id),
        )
        .first();

      if (!sem_user) {
        throw new ConvexError('TA user exists but does not have a sem_user entry');
      }

      const ta = await ctx.db
        .query('tas')
        .withIndex('by_semuser', (x) => x.eq('semester_user_id', sem_user._id))
        .first();

      if (!ta) {
        throw new ConvexError('TA user exists but does not have a ta entry');
      }

      await ctx.db.patch(sem_user._id, {
        kind: 'student',
      });
      await ctx.db.delete(ta._id);
    }
  },
});

/** Semester Management **/

export const changeSemester = mutation({
  args: {
    courseId: v.id('courses'),
    new_sem_name: v.string(),
    owner_emails: v.optional(v.array(v.string())),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { user_data } = await ensureAuthAndOwner(ctx, args.courseId);

    const queue_length = await getQueueLength(ctx, args.courseId);
    if (queue_length > 0) {
      throw new ConvexError('Queue is not empty');
    }

    const curr_sem = await getCurrentSemester(ctx, args.courseId);
    const curr_owners = curr_sem.owner_emails;

    if (!curr_owners.includes(user_data.email!)) {
      throw new ConvexError('User is not an owner of the current semester');
    }

    // try looking up next sem by name
    const existing_sem = await ctx.db
      .query('semesters')
      .withIndex('by_course_and_name', (x) =>
        x.eq('course_id', args.courseId).eq('name', args.new_sem_name),
      )
      .first();

    let new_sem_id;
    if (existing_sem) {
      new_sem_id = existing_sem._id;
    } else {
      const new_owners = args.owner_emails ?? curr_owners;
      const new_sem = await ctx.db.insert('semesters', {
        course_id: args.courseId,
        name: args.new_sem_name,
        owner_emails: new_owners,

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

      new_sem_id = new_sem;
    }

    const globalSettings = await getGlobalSettings(ctx, args.courseId);

    await ctx.db.patch(globalSettings._id, {
      curr_sem: new_sem_id,
    });
  },
});

/** Slack Integration **/

export const updateSlackURL = mutation({
  args: {
    courseId: v.id('courses'),
    slackURL: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ensureAuthAndAdmin(ctx, args.courseId);

    const globalSettings = await getGlobalSettings(ctx, args.courseId);

    await ctx.db.patch(globalSettings._id, {
      slackbot_webhook_url: args.slackURL,
    });
  },
});
