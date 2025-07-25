import { ConvexError, v } from 'convex/values';
import { mutation } from './_generated/server';
import { getCurrentUser } from './common';

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
});
