import { ConvexError, v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { getAuthUserId } from '@convex-dev/auth/server';

export const listCourses = query({
  args: {},
  handler: async (ctx) => {
    const courses = await ctx.db.query('courses').collect();
    return courses.map((c) => ({ _id: c._id, slug: c.slug, display_name: c.display_name }));
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

export const createCourse = mutation({
  args: {
    slug: v.string(),
    display_name: v.string(),
    semester_name: v.string(),
    owner_emails: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    // Course creation requires sign-in. The OAuth-redirect flow in CreateCoursePage
    // signs in the owner immediately after this returns, so this gate prevents
    // anonymous creation but otherwise matches existing UX.
    const user_id = await getAuthUserId(ctx);
    if (!user_id) {
      throw new ConvexError('Must be signed in to create a course');
    }

    if (!/^[a-z0-9-]+$/.test(args.slug)) {
      throw new ConvexError('Slug must be lowercase letters, digits, and hyphens only');
    }

    // Reserved: would shadow top-level routes or backend prefixes.
    const RESERVED_SLUGS = new Set(['create', 'api', 'auth', 'ohq', 'admin', 'login', 'logout']);
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
    });

    await ctx.db.insert('waittime_ping_data', {
      course_id: courseId,
      minute_ago_waittime: 0,
      last_pinged: 0,
    });

    return { slug: args.slug, courseId };
  },
});
