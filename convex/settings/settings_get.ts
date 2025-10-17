import { query } from '../_generated/server';
import { v } from 'convex/values';
import { getCurrentSemester, getCurrentUser, getTA } from '../common';

export const getQueueSettings = query({
  args: {},
  returns: v.object({
    courseName: v.string(),
    currSem: v.id('semesters'),
    slackURL: v.optional(v.string()),
    questionsURL: v.optional(v.string()),
    rejoinTimeMins: v.number(),
    allowCDOverride: v.boolean(),
    dayDictionary: v.record(v.string(), v.array(v.string())),
    allowShowOthersTimer: v.boolean(),
    allowedEmailDomains: v.array(v.string()),
  }),
  handler: async (ctx, args) => {
    const globalSettings = (await ctx.db.query('globalSettings').first())!;

    return {
      courseName: globalSettings.course_name,
      currSem: globalSettings.curr_sem,
      slackURL: globalSettings.slackbot_webhook_url,
      questionsURL: globalSettings.questions_policy_url,
      rejoinTimeMins: globalSettings.rejoin_time_ms / 60000, // convert ms to minutes
      allowCDOverride: globalSettings.allow_cooldown_override,
      dayDictionary: globalSettings.day_to_location_dict,
      allowShowOthersTimer: globalSettings.allow_tas_show_others_timer,
      allowedEmailDomains: globalSettings.allowed_email_domains,
    };
  },
});

export const getAccessControlSettings = query({
  args: {},
  returns: v.object({
    whitelistEnabled: v.boolean(),
    blacklistEnabled: v.boolean(),
    whitelistEmails: v.array(v.string()),
    blacklistEmails: v.array(v.string()),
  }),
  handler: async (ctx, args) => {
    const user_data = (await getCurrentUser(ctx))!;

    if (user_data.kind !== 'TA') {
      throw new Error('User is not a TA');
    }

    const ta = (await getTA(ctx, user_data.sem_user_id))!;

    if (!ta.is_admin) {
      throw new Error('User is not an admin');
    }

    const curr_sem = await getCurrentSemester(ctx);

    // Get all users in whitelist
    const whitelistUsers = await Promise.all(
      curr_sem.whitelist.map(async (userId) => {
        const user = await ctx.db.get(userId);
        return user?.email || '';
      })
    );

    // Get all users in blacklist
    const blacklistUsers = await Promise.all(
      curr_sem.blacklist.map(async (userId) => {
        const user = await ctx.db.get(userId);
        return user?.email || '';
      })
    );

    return {
      whitelistEnabled: curr_sem.enable_whitelist,
      blacklistEnabled: curr_sem.enable_blacklist,
      whitelistEmails: whitelistUsers.filter((email) => email !== ''),
      blacklistEmails: blacklistUsers.filter((email) => email !== ''),
    };
  },
});

export const getLocations = query({
  args: {},
  returns: v.object({
    dayDictionary: v.record(v.string(), v.array(v.string())),
    roomDictionary: v.record(v.string(), v.array(v.number())),
  }),
  handler: async (ctx, args) => {
    const globalSettings = (await ctx.db.query('globalSettings').first())!;
    const dayDictionary = globalSettings.day_to_location_dict;

    // Convert day-to-room dictionary to room-to-day dictionary
    const roomDictionary: Record<string, Array<number>> = {};

    for (const [key, rooms] of Object.entries(dayDictionary)) {
      const dayNum = parseInt(key);
      if (isNaN(dayNum)) continue;

      for (const room of rooms) {
        if (!roomDictionary[room]) {
          roomDictionary[room] = [];
        }
        roomDictionary[room].push(dayNum);
      }
    }

    return {
      dayDictionary,
      roomDictionary,
    };
  },
});
