import Google from '@auth/core/providers/google';
import { convexAuth } from '@convex-dev/auth/server';
import { MutationCtx } from './_generated/server';
import { internal } from './_generated/api';

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Google],
  callbacks: {
    async afterUserCreatedOrUpdated(ctx: MutationCtx, args) {
      const user_id = args.userId;
      await ctx.runMutation(internal.common.internalNewSemesterUser, {
        user_id: user_id,
      });
    },
  },
});
