import { ConvexError, v } from 'convex/values';
import { query } from '../_generated/server';
import {
  ensureAuthAndAdmin,
  getCurrentSemester,
  getCurrentUser,
  getGlobalSettings,
} from '../common';
import { Id } from '../_generated/dataModel';
import { QueryCtx } from '../_generated/server';

// Settings pages render for both TAs and course owners. This helper gates
// "settings reads" — it accepts either role and throws otherwise.
async function ensureAuthAndTAOrOwner(ctx: QueryCtx, courseId: Id<'courses'>) {
  const user_data = await getCurrentUser(ctx, courseId);
  if (!user_data) {
    throw new ConvexError('User not authenticated');
  }
  const curr_sem = await getCurrentSemester(ctx, courseId);
  const isOwner = curr_sem.owner_emails.includes(user_data.email!);
  const isTA = user_data.kind === 'TA';
  if (!isTA && !isOwner) {
    throw new ConvexError('User is not a TA or owner');
  }
}

export const getQueueSettings = query({
  args: { courseId: v.id('courses') },
  returns: v.object({
    courseName: v.string(),
    currSem: v.string(),
    slackURL: v.optional(v.string()),
    questionsURL: v.optional(v.string()),
    rejoinTimeMins: v.number(),
    allowCDOverride: v.boolean(),
    dayDictionary: v.record(v.string(), v.array(v.string())),
    allowShowOthersTimer: v.boolean(),
    allowedEmailDomains: v.array(v.string()),
    enforceEmailDomains: v.boolean(),
    ownerEmails: v.array(v.string()),
    timezone: v.string(),
  }),
  handler: async (ctx, args) => {
    // Returns sensitive fields (slackURL, ownerEmails) — gate on TA or owner.
    await ensureAuthAndTAOrOwner(ctx, args.courseId);

    const globalSettings = await getGlobalSettings(ctx, args.courseId);

    const curr_sem = await getCurrentSemester(ctx, args.courseId);

    return {
      courseName: globalSettings.course_name,
      currSem: curr_sem.name,
      slackURL: globalSettings.slackbot_webhook_url,
      questionsURL: globalSettings.questions_policy_url,
      rejoinTimeMins: globalSettings.rejoin_time_ms / 60000, // convert ms to minutes
      allowCDOverride: globalSettings.allow_cooldown_override,
      dayDictionary: globalSettings.day_to_location_dict,
      allowShowOthersTimer: globalSettings.allow_tas_show_others_timer,
      allowedEmailDomains: globalSettings.allowed_email_domains,
      enforceEmailDomains: globalSettings.enforce_email_domain,
      ownerEmails: curr_sem.owner_emails,
      timezone: globalSettings.timezone,
    };
  },
});

export const getTimezone = query({
  args: { courseId: v.id('courses') },
  returns: v.string(),
  handler: async (ctx, args) => {
    const globalSettings = await getGlobalSettings(ctx, args.courseId);
    return globalSettings.timezone;
  },
});

export const getAccessControlSettings = query({
  args: { courseId: v.id('courses') },
  returns: v.object({
    whitelistEnabled: v.boolean(),
    blacklistEnabled: v.boolean(),
    whitelistEmails: v.array(v.string()),
    blacklistEmails: v.array(v.string()),
  }),
  handler: async (ctx, args) => {
    await ensureAuthAndAdmin(ctx, args.courseId);

    const curr_sem = await getCurrentSemester(ctx, args.courseId);

    return {
      whitelistEnabled: curr_sem.enable_whitelist,
      blacklistEnabled: curr_sem.enable_blacklist,
      whitelistEmails: curr_sem.whitelist,
      blacklistEmails: curr_sem.blacklist,
    };
  },
});

export const getLocations = query({
  args: { courseId: v.id('courses') },
  returns: v.object({
    dayDictionary: v.record(v.string(), v.array(v.string())),
    roomDictionary: v.record(v.string(), v.array(v.number())),
  }),
  handler: async (ctx, args) => {
    const globalSettings = await getGlobalSettings(ctx, args.courseId);

    const dayDictionary = globalSettings.day_to_location_dict;

    // Convert day-to-room dictionary to room-to-day dictionary
    const roomDictionary: Record<string, Array<number>> = {};

    for (const [key, rooms] of Object.entries(dayDictionary)) {
      const dayNum = parseInt(key);
      if (isNaN(dayNum)) {
        console.error(`Invalid day number: ${key}`);
        continue;
      }

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

export const getAllTAs = query({
  args: { courseId: v.id('courses') },
  returns: v.array(
    v.object({
      id: v.string(),
      name: v.string(),
      email: v.string(),
      isAdmin: v.boolean(),
      future_ta: v.boolean(),
    }),
  ),
  handler: async (ctx, args) => {
    // The TA list (with admin flags) is admin-or-owner sensitive.
    await ensureAuthAndTAOrOwner(ctx, args.courseId);

    const curr_sem = await getCurrentSemester(ctx, args.courseId);
    const ta_sem_users = await ctx.db
      .query('semesterUsers')
      .withIndex('by_sem_and_kind', (x) => x.eq('semester_id', curr_sem._id).eq('kind', 'TA'))
      .collect();

    const tas = await Promise.all(
      ta_sem_users.map(async (sem_user) => {
        const ta_promise = ctx.db
          .query('tas')
          .withIndex('by_semuser', (x) => x.eq('semester_user_id', sem_user._id))
          .first();

        const user_promise = ctx.db.get(sem_user.user_id);

        const [ta, user] = await Promise.all([ta_promise, user_promise]);

        return {
          ta: ta!,
          user: user!,
        };
      }),
    );

    const future_tas = await ctx.db
      .query('future_tas')
      .withIndex('by_sem_and_email', (x) => x.eq('semester_id', curr_sem._id))
      .collect();

    const tas_res = tas.map((ta) => ({
      id: ta.ta._id as string,
      name: ta.user.name!, // this is real and not preferred name as this query is only used in admin settings, which should show the real TA name
      email: ta.user.email!,
      isAdmin: ta.ta.is_admin,
      future_ta: false,
    }));

    const future_tas_res = future_tas.map((future_ta) => ({
      id: future_ta._id as string,
      name: future_ta.name,
      email: future_ta.email,
      isAdmin: future_ta.is_admin,
      future_ta: true,
    }));

    return [...tas_res, ...future_tas_res];
  },
});
