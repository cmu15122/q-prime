import Google from '@auth/core/providers/google';
import { convexAuth } from '@convex-dev/auth/server';
import { MutationCtx } from './_generated/server';
import { internal } from './_generated/api';

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Google],
  callbacks: {
    // Multi-tenant: at sign-in we have no course context. Just ensure userPreferences
    // exists. Per-course enrollment happens lazily when the user lands on a /:slug route
    // (CourseScope -> enrollInCourse mutation).
    async afterUserCreatedOrUpdated(ctx: MutationCtx, args) {
      await ctx.runMutation(internal.common.internalUpsertUserPrefs, {
        user_id: args.userId,
      });
    },
  },
});
