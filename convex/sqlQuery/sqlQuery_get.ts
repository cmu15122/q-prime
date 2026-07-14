import { ConvexError, v } from 'convex/values';
import { query } from '../_generated/server';
import { ensureAuthAndAdmin, getCurrentUser, getGlobalSettings } from '../common';
import { buildViews } from './sqlQuery_views';

/**
 * Module status: env var + globalSettings toggle + user admin flag.
 * UI uses this to decide whether to render the SQL page and navbar link.
 */
export const getSqlModuleStatus = query({
  args: {},
  returns: v.object({
    envEnabled: v.boolean(),
    settingEnabled: v.boolean(),
    isAdmin: v.boolean(),
  }),
  handler: async (ctx) => {
    const envEnabled = process.env.SQL_MODULE_ENABLED === 'true';

    let settingEnabled = false;
    try {
      const globalSettings = await getGlobalSettings(ctx);
      settingEnabled = globalSettings.sql_module_enabled === true;
    } catch {
      settingEnabled = false;
    }

    let isAdmin = false;
    try {
      const user = await getCurrentUser(ctx);
      if (user && user.kind === 'TA') {
        const ta = await ctx.db
          .query('tas')
          .withIndex('by_semuser', (q) => q.eq('semester_user_id', user.sem_user_id))
          .first();
        isAdmin = ta?.is_admin === true;
      }
    } catch {
      isAdmin = false;
    }

    return { envEnabled, settingEnabled, isAdmin };
  },
});

/**
 * Return denormalized, read-only views of the course data for the
 * admin to run SQL against on the client.
 *
 * Gated on: admin + env var + globalSettings toggle.
 * Safe by construction: the returned arrays are copies, so no client-side
 * SQL mutation can affect Convex data.
 */
export const getViews = query({
  args: {},
  handler: async (ctx) => {
    const envEnabled = process.env.SQL_MODULE_ENABLED === 'true';
    if (!envEnabled) {
      throw new ConvexError('SQL module is disabled (SQL_MODULE_ENABLED is not set)');
    }

    const globalSettings = await getGlobalSettings(ctx);
    if (globalSettings.sql_module_enabled !== true) {
      throw new ConvexError(
        'SQL module is disabled in settings. An admin can enable it from Settings.',
      );
    }

    await ensureAuthAndAdmin(ctx);

    return await buildViews(ctx);
  },
});
