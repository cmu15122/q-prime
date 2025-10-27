import { ConvexError, v } from 'convex/values';
import { mutation } from '../_generated/server';
import {
  ensureAuthAndAdmin,
  ensureAuthAndTA,
  getCurrentSemester,
  getCurrentUser,
  getGlobalSettings,
} from '../common';

/** General Settings (User-specific) **/

export const updateVideoChat = mutation({
  args: {
    enabled: v.boolean(),
    url: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { ta } = await ensureAuthAndTA(ctx);

    await ctx.db.patch(ta._id, {
      zoom_enabled: args.enabled,
      zoom_url: args.url,
    });

    return null;
  },
});

export const updatePreferredName = mutation({
  args: {
    preferred_name: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user_data = (await getCurrentUser(ctx))!;

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
    joinEnabled: v.boolean(),
    remindEnabled: v.boolean(),
    remindTime: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { ta } = await ensureAuthAndTA(ctx);

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
    showSelfTimer: v.boolean(),
    showOthersTimer: v.boolean(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { ta } = await ensureAuthAndTA(ctx);

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
    courseName: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ensureAuthAndAdmin(ctx);

    if (!args.courseName) {
      throw new ConvexError('Course name cannot be empty');
    }

    const globalSettings = await getGlobalSettings(ctx);

    await ctx.db.patch(globalSettings._id, {
      course_name: args.courseName,
    });

    return null;
  },
});

export const updateQuestionsURL = mutation({
  args: {
    questionsURL: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ensureAuthAndAdmin(ctx);

    if (!args.questionsURL) {
      throw new ConvexError('Questions URL cannot be empty');
    }

    const globalSettings = await getGlobalSettings(ctx);

    await ctx.db.patch(globalSettings._id, {
      questions_policy_url: args.questionsURL,
    });

    return null;
  },
});

export const updateRejoinTime = mutation({
  args: {
    rejoinTime: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ensureAuthAndAdmin(ctx);

    if (isNaN(args.rejoinTime) || args.rejoinTime < 0) {
      throw new ConvexError('Rejoin time must be a non-negative number');
    }

    const globalSettings = await getGlobalSettings(ctx);

    await ctx.db.patch(globalSettings._id, {
      rejoin_time_ms: args.rejoinTime * 60000, // convert minutes to ms
    });

    return null;
  },
});

export const updateEnforceEmailDomain = mutation({
  args: {
    enforceEmailDomain: v.boolean(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ensureAuthAndAdmin(ctx);

    const globalSettings = await getGlobalSettings(ctx);

    await ctx.db.patch(globalSettings._id, {
      enforce_email_domain: args.enforceEmailDomain,
    });

    return null;
  },
});

export const updateAllowCooldownOverride = mutation({
  args: {
    allowCDOverride: v.boolean(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ensureAuthAndAdmin(ctx);

    const globalSettings = await getGlobalSettings(ctx);

    await ctx.db.patch(globalSettings._id, {
      allow_cooldown_override: args.allowCDOverride,
    });

    return null;
  },
});

export const updateAllowShowOthersTimer = mutation({
  args: {
    allowShowOthersTimer: v.boolean(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ensureAuthAndAdmin(ctx);

    const globalSettings = await getGlobalSettings(ctx);

    await ctx.db.patch(globalSettings._id, {
      allow_tas_show_others_timer: args.allowShowOthersTimer,
    });

    return null;
  },
});

/** Assignment Functions **/

export const createAssignment = mutation({
  args: {
    name: v.string(),
    category: v.optional(v.string()),
    start_date_ms: v.number(),
    end_date_ms: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ensureAuthAndAdmin(ctx);

    const curr_sem = await getCurrentSemester(ctx);

    await ctx.db.insert('assignments', {
      name: args.name,
      semester_id: curr_sem._id,
      assignment_type: args.category,
      start_date_ms: args.start_date_ms,
      end_date_ms: args.end_date_ms,
    });

    return null;
  },
});

export const updateAssignment = mutation({
  args: {
    assignment_id: v.id('assignments'),
    name: v.string(),
    category: v.optional(v.string()),
    start_date_ms: v.number(),
    end_date_ms: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ensureAuthAndAdmin(ctx);

    const assignment = await ctx.db.get(args.assignment_id);

    if (!assignment) {
      throw new ConvexError('Assignment not found');
    }

    await ctx.db.patch(args.assignment_id, {
      name: args.name,
      assignment_type: args.category,
      start_date_ms: args.start_date_ms,
      end_date_ms: args.end_date_ms,
    });

    return null;
  },
});

export const deleteAssignment = mutation({
  args: {
    assignment_id: v.id('assignments'),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ensureAuthAndAdmin(ctx);

    const assignment = await ctx.db.get(args.assignment_id);

    if (!assignment) {
      throw new ConvexError('Assignment not found');
    }

    await ctx.db.delete(args.assignment_id);

    return null;
  },
});

/** Location Functions **/

export const addLocation = mutation({
  args: {
    room: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ensureAuthAndAdmin(ctx);

    if (!args.room) {
      throw new ConvexError('Room name cannot be empty');
    }

    const globalSettings = await getGlobalSettings(ctx);

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
    room: v.string(),
    days: v.array(v.string()),
    daysOfWeek: v.record(v.string(), v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ensureAuthAndAdmin(ctx);

    const globalSettings = await getGlobalSettings(ctx);

    const newDayDictionary = { ...globalSettings.day_to_location_dict };

    for (const day in args.daysOfWeek) {
      if (args.days.includes(args.daysOfWeek[day])) {
        // day is selected for room
        const currRoomForDay = newDayDictionary[day];
        if (!currRoomForDay) {
          newDayDictionary[day] = [args.room];
        } else if (!currRoomForDay.includes(args.room)) {
          newDayDictionary[day] = [...currRoomForDay, args.room];
        }
      } else {
        // day is NOT selected for room
        const currRoomForDay = newDayDictionary[day];
        if (currRoomForDay && currRoomForDay.includes(args.room)) {
          newDayDictionary[day] = currRoomForDay.filter((r) => r !== args.room);
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
    room: v.string(),
    days: v.array(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ensureAuthAndAdmin(ctx);
    const globalSettings = await getGlobalSettings(ctx);
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
    enableWhitelist: v.boolean(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ensureAuthAndAdmin(ctx);

    const curr_sem = await getCurrentSemester(ctx);

    await ctx.db.patch(curr_sem._id, {
      enable_whitelist: args.enableWhitelist,
    });

    return null;
  },
});

export const updateBlacklistSettings = mutation({
  args: {
    enableBlacklist: v.boolean(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ensureAuthAndAdmin(ctx);

    const curr_sem = await getCurrentSemester(ctx);

    await ctx.db.patch(curr_sem._id, {
      enable_blacklist: args.enableBlacklist,
    });

    return null;
  },
});

export const updateAccessControlledUser = mutation({
  args: {
    email: v.string(),
    listType: v.union(v.literal('whitelist'), v.literal('blacklist')),
    updateType: v.union(v.literal('add'), v.literal('remove')),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ensureAuthAndAdmin(ctx);

    const curr_sem = await getCurrentSemester(ctx);

    if (args.listType === 'whitelist') {
      if (args.updateType === 'add') {
        // Check if already on blacklist
        if (curr_sem.blacklist.includes(args.email)) {
          throw new ConvexError(
            'User is on the blacklist and cannot be added to the whitelist'
          );
        }

        // Add to whitelist if not already there
        if (!curr_sem.whitelist.includes(args.email)) {
          await ctx.db.patch(curr_sem._id, {
            whitelist: [...curr_sem.whitelist, args.email],
          });
        }
      } else {
        // Remove from whitelist
        await ctx.db.patch(curr_sem._id, {
          whitelist: curr_sem.whitelist.filter((email) => email !== args.email),
        });
      }
    } else {
      // blacklist
      if (args.updateType === 'add') {
        // Check if already on whitelist
        if (curr_sem.whitelist.includes(args.email)) {
          throw new ConvexError(
            'User is on the whitelist and cannot be added to the blacklist'
          );
        }

        // Add to blacklist if not already there
        if (!curr_sem.blacklist.includes(args.email)) {
          await ctx.db.patch(curr_sem._id, {
            blacklist: [...curr_sem.blacklist, args.email],
          });
        }
      } else {
        // Remove from blacklist
        await ctx.db.patch(curr_sem._id, {
          blacklist: curr_sem.blacklist.filter((id) => id !== args.email),
        });
      }
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
    name: v.string(),
    email: v.string(),
    isAdmin: v.boolean(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Cannot implement without understanding the full user creation flow
    // and how it integrates with the auth system. This would require:
    // 1. Creating or finding a user in the users table (managed by auth)
    // 2. Creating userPreferences
    // 3. Creating a semesterUser
    // 4. Creating a TA record
    // The auth system integration makes this unsafe to implement without more context.
    throw new ConvexError('Not implemented - requires auth system integration');
  },
});

export const updateTA = mutation({
  args: {
    user_id: v.id('users'),
    isAdmin: v.boolean(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Cannot implement without understanding how to safely look up and update
    // TAs across semesters. Need to ensure we're updating the correct TA record
    // for the current semester and validating permissions properly.
    throw new ConvexError('Not implemented - requires careful TA lookup logic');
  },
});

export const deleteTA = mutation({
  args: {
    user_id: v.id('users'),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Cannot implement without understanding whether this should:
    // 1. Delete the TA record entirely
    // 2. Just remove TA status from semesterUser
    // 3. Soft-delete or archive the TA
    // The original code modifies semesterUser.is_ta which doesn't exist in our schema.
    throw new ConvexError('Not implemented - schema mismatch on TA deletion');
  },
});

/** Semester Management **/

export const updateSemester = mutation({
  args: {
    sem_id: v.id('semesters'),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Cannot implement without understanding:
    // 1. How semester transitions should work
    // 2. What happens to existing queue data
    // 3. User migration between semesters
    // 4. Permission requirements (owner-only in original)
    // This is a complex operation that affects the entire system.
    throw new ConvexError(
      'Not implemented - requires complex semester transition logic'
    );
  },
});

/** Slack Integration **/

export const updateSlackURL = mutation({
  args: {
    slackURL: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Cannot implement without understanding:
    // 1. How to properly validate webhook URLs
    // 2. What the slack.update_slack() function does
    // 3. Whether there are external side effects that need to be triggered
    // The original triggers an external slack controller update.
    throw new ConvexError(
      'Not implemented - requires external slack integration'
    );
  },
});

/** CSV Upload/Download Functions **/
// These functions require HTTP actions with file handling which is a different
// pattern than mutations. They should be implemented as httpAction in convex/http.ts
// rather than as mutations here. Examples:
// - downloadTopicCSV
// - uploadTopicCSV
// - downloadTACSV
// - uploadTACSV
// - downloadAccessControlCSV
// - uploadAccessControlCSV
