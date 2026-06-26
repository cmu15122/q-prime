import { ConvexError, v } from 'convex/values';
import { mutation, query, QueryCtx, MutationCtx } from './_generated/server';
import { getAuthUserId } from '@convex-dev/auth/server';

async function findOwnedCourseForEmail(ctx: QueryCtx | MutationCtx, email: string) {
  const semesters = await ctx.db.query('semesters').collect();
  const owned_sem = semesters.find((s) => s.owner_emails.includes(email));
  if (!owned_sem) return null;
  return await ctx.db.get(owned_sem.course_id);
}

// Used by single-OHQ mode to decide whether the root URL should send visitors
// to /create (no course yet) or to the existing course's slug.
export const getFirstCourse = query({
  args: {},
  handler: async (ctx) => {
    const course = await ctx.db.query('courses').first();
    if (!course) return null;
    return { slug: course.slug, display_name: course.display_name };
  },
});

export const getCourseBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('courses')
      .withIndex('by_slug', (q) => q.eq('slug', args.slug))
      .unique();
  },
});

// Returns the (single) course where the signed-in user's email appears in any
// semester's `owner_emails`, or null. Each user owns at most one course; this
// invariant is enforced by `createCourse` below.
export const getMyOwnedCourse = query({
  args: {},
  handler: async (ctx) => {
    const user_id = await getAuthUserId(ctx);
    if (!user_id) return null;
    const user = await ctx.db.get(user_id);
    const email = (user as { email?: string } | null)?.email;
    if (!email) return null;
    const course = await findOwnedCourseForEmail(ctx, email);
    if (!course) return null;
    return { _id: course._id, slug: course.slug, display_name: course.display_name };
  },
});

export const createCourse = mutation({
  args: {
    slug: v.string(),
    display_name: v.string(),
    semester_name: v.string(),
    owner_emails: v.array(v.string()),
    theme_primary: v.optional(v.string()),
    theme_secondary: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user_id = await getAuthUserId(ctx);
    if (!user_id) {
      throw new ConvexError('Must be signed in to create a course');
    }

    const user = await ctx.db.get(user_id);
    const caller_email = (user as { email?: string } | null)?.email;
    if (!caller_email) {
      throw new ConvexError('Your account has no email; cannot create a course');
    }

    const already_owned = await findOwnedCourseForEmail(ctx, caller_email);
    if (already_owned) {
      throw new ConvexError(
        `You already own a course (${already_owned.display_name}); each account can own only one.`,
      );
    }

    if (!/^[a-z0-9-]+$/.test(args.slug)) {
      throw new ConvexError('Slug must be lowercase letters, digits, and hyphens only');
    }

    // Reserved: would shadow top-level routes, backend prefixes, or nginx-intercepted paths.
    const RESERVED_SLUGS = new Set([
      'create',
      'api',
      'auth',
      'ohq',
      'admin',
      'login',
      'logout',
      'signin',
      'signup',
      'health',
      'dashboard',
    ]);
    if (RESERVED_SLUGS.has(args.slug)) {
      throw new ConvexError(`Name "${args.slug}" is reserved`);
    }

    const existing = await ctx.db
      .query('courses')
      .withIndex('by_slug', (q) => q.eq('slug', args.slug))
      .unique();
    if (existing) {
      throw new ConvexError('A course with that slug already exists');
    }

    // The caller must be in the owner_emails list — otherwise creating a course
    // would lock them out of admin access on the very course they just made.
    if (!args.owner_emails.includes(caller_email)) {
      throw new ConvexError('Your email must be included in the owner emails list');
    }

    const courseId = await ctx.db.insert('courses', {
      slug: args.slug,
      display_name: args.display_name,
    });

    const new_sem = await ctx.db.insert('semesters', {
      course_id: courseId,
      name: args.semester_name,
      owner_emails: args.owner_emails,
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

    await ctx.db.insert('globalSettings', {
      course_id: courseId,
      curr_sem: new_sem,
      course_name: args.display_name,
      timezone: 'UTC',
      slackbot_webhook_url: undefined,
      questions_policy_url: undefined,
      rejoin_time_ms: 15 * 60000,
      allowed_email_domains: [],
      enforce_email_domain: false,
      allow_cooldown_override: false,
      // -1 is used as list of all locations (legacy decision)
      day_to_location_dict: {
        '-1': [],
        '0': [],
        '1': [],
        '2': [],
        '3': [],
        '4': [],
        '5': [],
        '6': [],
      },
      allow_tas_show_others_timer: false,
      waittime_ping_threshold_mins: 30,
      waittime_ping_interval_mins: 10,
      waittime_questions_lookback_time_mins: 60,
      is_frozen: true,
      announcements: [],
      theme_primary: args.theme_primary,
      theme_secondary: args.theme_secondary,
    });

    await ctx.db.insert('waittime_ping_data', {
      course_id: courseId,
      minute_ago_waittime: 0,
      last_pinged: 0,
    });

    return { slug: args.slug, courseId };
  },
});
