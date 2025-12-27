import { ConvexError, v } from 'convex/values';
import { query } from './_generated/server';
import { getCurrentUser } from './common';

// notifs work by returning a boolean that changes from false -> true

export const getNotif = query({
  args: {},
  returns: v.object({
    title: v.string(),
    body: v.string(),
    timestamp: v.number(),
  }),
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    if (!user) {
      throw new ConvexError('Not logged in');
    }

    const semuser = await ctx.db.get(user?.sem_user_id);

    if (!semuser) {
      throw new ConvexError('No current semuser for user');
    }

    return semuser.notification;
  },
});
