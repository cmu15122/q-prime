import { QueryCtx } from './_generated/server';
import { ConvexError } from 'convex/values';
import { getAuthUserId } from '@convex-dev/auth/server';

export async function getCurrentSemester(ctx: QueryCtx) {
  const globalSettings = (await ctx.db.query('globalSettings').first())!;
  const curr_sem = (await ctx.db.get(globalSettings.curr_sem))!;
  return curr_sem;
}

export async function getCurrentUser(ctx: QueryCtx) {
  const user_id = await getAuthUserId(ctx);

  if (!user_id) {
    return null;
  }

  const user_data = (await ctx.db.get(user_id))!;
  const curr_sem = await getCurrentSemester(ctx);

  const curr_sem_user = (await ctx.db
    .query('semesterUsers')
    .withIndex('by_sem_and_user', (q) =>
      q.eq('semester_id', curr_sem._id).eq('user_id', user_id)
    )
    .first())!;

  // TODO - make sure we create new sem users for old users on first login of new sem

  const user_prefs = (await ctx.db.get(curr_sem_user.user_prefs_id))!;

  return {
    ...user_data,
    preferred_name: user_prefs.preferred_name,
    sem_user_id: curr_sem_user._id,
    kind: curr_sem_user.kind,
  };
}
