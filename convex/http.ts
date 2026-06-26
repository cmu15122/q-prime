import { httpRouter } from 'convex/server';
import { httpAction } from './_generated/server';
import { api, internal } from './_generated/api';
import { auth } from './auth';
import { getAuthUserId } from '@convex-dev/auth/server';
import { DateTime } from 'luxon';
import { Id } from './_generated/dataModel';
import { HEX_COLOR } from './common';

const http = httpRouter();

// API prefix for HTTP routes (default: '/api')
// Set via: npx convex env set HTTP_API_PREFIX /api
// For local dev without nginx, set to empty string: npx convex env set HTTP_API_PREFIX ""
const API_PREFIX = process.env.HTTP_API_PREFIX ?? '/api';

auth.addHttpRoutes(http);

/**
 * Helper function to create CORS headers.
 */
function createCorsHeaders(additionalHeaders: Record<string, string> = {}) {
  const origin = process.env.SITE_URL || '*';
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400', // 24 hours
    ...additionalHeaders,
  };
}

/**
 * Helper function to handle preflight requests.
 */
function handlePreflight() {
  return new Response(null, {
    status: 204,
    headers: createCorsHeaders(),
  });
}

/**
 * Multi-tenant: every CSV route requires ?courseId=<id> in the request URL.
 */
function getCourseIdFromRequest(request: Request): Id<'courses'> {
  const url = new URL(request.url);
  const courseId = url.searchParams.get('courseId');
  if (!courseId) {
    throw new Error('Missing courseId query parameter');
  }
  return courseId as Id<'courses'>;
}

// OPTIONS handler for download_assignment_csv
http.route({
  path: `${API_PREFIX}/download_assignment_csv`,
  method: 'OPTIONS',
  handler: httpAction(async () => handlePreflight()),
});

http.route({
  path: `${API_PREFIX}/download_assignment_csv`,
  method: 'GET',
  handler: httpAction(async (ctx, request) => {
    const user = await getAuthUserId(ctx);

    if (!user) {
      throw new Error('User not authenticated');
    }

    const courseId = getCourseIdFromRequest(request);

    // ensure user is a TA
    const is_ta = await ctx.runQuery(internal.common.internalEnsureTA, {
      user_id: user,
      courseId,
    });

    if (!is_ta) {
      throw new Error('User is not a TA');
    }

    const csvContent = [
      'name,assignment_type,start_date,end_date',
      'Example Written,Written,8/5/22 9:00 PM,8/12/22 9:00 PM',
    ].join('\n');

    return new Response(csvContent, {
      status: 200,
      headers: createCorsHeaders({
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="assignments_example.csv"`,
      }),
    });
  }),
});

// OPTIONS handler for download_tas_csv
http.route({
  path: `${API_PREFIX}/download_tas_csv`,
  method: 'OPTIONS',
  handler: httpAction(async () => handlePreflight()),
});

http.route({
  path: `${API_PREFIX}/download_tas_csv`,
  method: 'GET',
  handler: httpAction(async (ctx, request) => {
    const user = await getAuthUserId(ctx);

    if (!user) {
      throw new Error('User not authenticated');
    }

    const courseId = getCourseIdFromRequest(request);

    // ensure user is a TA
    const is_ta = await ctx.runQuery(internal.common.internalEnsureTAOrOwner, {
      user_id: user,
      courseId,
    });

    if (!is_ta) {
      throw new Error('User is not a TA or Owner');
    }

    const csvContent = ['name,email,is_admin', 'Example TA,ta@andrew.cmu.edu,false'].join('\n');

    return new Response(csvContent, {
      status: 200,
      headers: createCorsHeaders({
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="tas_example.csv"`,
      }),
    });
  }),
});

// OPTIONS handler for download_access_control_csv
http.route({
  path: `${API_PREFIX}/download_access_control_csv`,
  method: 'OPTIONS',
  handler: httpAction(async () => handlePreflight()),
});

http.route({
  path: `${API_PREFIX}/download_access_control_csv`,
  method: 'GET',
  handler: httpAction(async (ctx, request) => {
    const user = await getAuthUserId(ctx);

    if (!user) {
      throw new Error('User not authenticated');
    }

    const courseId = getCourseIdFromRequest(request);

    // ensure user is a TA
    const is_ta = await ctx.runQuery(internal.common.internalEnsureTA, {
      user_id: user,
      courseId,
    });

    if (!is_ta) {
      throw new Error('User is not a TA');
    }

    const csvContent = [
      'email,is_whitelisted,is_blacklisted',
      'example@andrew.cmu.edu,false,false',
    ].join('\n');

    return new Response(csvContent, {
      status: 200,
      headers: createCorsHeaders({
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="access_control_template.csv"`,
      }),
    });
  }),
});

// OPTIONS handler for download_questions_csv
http.route({
  path: `${API_PREFIX}/download_questions_csv`,
  method: 'OPTIONS',
  handler: httpAction(async () => handlePreflight()),
});

http.route({
  path: `${API_PREFIX}/download_questions_csv`,
  method: 'GET',
  handler: httpAction(async (ctx, request) => {
    const user = await getAuthUserId(ctx);

    if (!user) {
      throw new Error('User not authenticated');
    }

    const courseId = getCourseIdFromRequest(request);

    const { semesterName, rows } = await ctx.runQuery(
      internal.metrics.internalGetQuestionsCsvDump,
      { user_id: user, courseId },
    );

    const headers = [
      'question_id',
      'semester_id',
      'semester_name',
      'assignment_id',
      'assignment_name',
      'student_id',
      'student_name',
      'student_email',
      'ta_id',
      'ta_name',
      'ta_email',
      'question',
      'location',
      'created_by',
      'finished_by',
      'entry_time_ms',
      'entry_time_iso',
      'exit_time_ms',
      'exit_time_iso',
      'help_duration_ms',
      'num_asked_to_fix',
    ] as const;

    const escapeCell = (val: unknown): string => {
      const s = val == null ? '' : String(val);
      return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };

    const lines: string[] = [headers.join(',')];
    for (const row of rows) {
      lines.push(headers.map((h) => escapeCell(row[h])).join(','));
    }
    const csvContent = lines.join('\r\n');

    const safeSemName = semesterName.replace(/[^a-zA-Z0-9_-]/g, '_') || 'semester';
    const filename = `questions_${safeSemName}.csv`;

    return new Response(csvContent, {
      status: 200,
      headers: createCorsHeaders({
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      }),
    });
  }),
});

// OPTIONS handler for upload_assignment_csv
http.route({
  path: `${API_PREFIX}/upload_assignment_csv`,
  method: 'OPTIONS',
  handler: httpAction(async () => handlePreflight()),
});

http.route({
  path: `${API_PREFIX}/upload_assignment_csv`,
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
    const user = await getAuthUserId(ctx);

    if (!user) {
      throw new Error('User not authenticated');
    }

    const courseId = getCourseIdFromRequest(request);

    // ensure user is a TA
    const is_ta = await ctx.runQuery(internal.common.internalEnsureTA, {
      user_id: user,
      courseId,
    });

    if (!is_ta) {
      throw new Error('User is not a TA');
    }

    const blob = await request.blob();
    const csvData = await blob.text();

    const csvRows = await ctx.runAction(internal.actions.parseCsvNode, {
      csvText: csvData,
    });

    const globalSettings = await ctx.runQuery(internal.common.internalGetGlobalSettings, {
      courseId,
    });
    const timezone = globalSettings.timezone;

    for (const assignment of csvRows) {
      const name = assignment.name;
      const assignment_type = assignment.assignment_type;

      // Try to parse with the example csv format first, then ISO, then JS
      let startDt = DateTime.fromFormat(assignment.start_date, 'M/d/yy h:mm a', { zone: timezone });
      if (!startDt.isValid) {
        startDt = DateTime.fromISO(assignment.start_date, { zone: timezone });
      }
      // Fallback to JS Date parsing if both fail, assuming local/UTC as before but wrapped in DateTime
      if (!startDt.isValid) {
        startDt = DateTime.fromJSDate(new Date(assignment.start_date)).setZone(timezone, {
          keepLocalTime: true,
        });
      }

      let endDt = DateTime.fromFormat(assignment.end_date, 'M/d/yy h:mm a', {
        zone: timezone,
      });
      if (!endDt.isValid) {
        endDt = DateTime.fromISO(assignment.end_date, { zone: timezone });
      }
      if (!endDt.isValid) {
        endDt = DateTime.fromJSDate(new Date(assignment.end_date)).setZone(timezone, {
          keepLocalTime: true,
        });
      }

      await ctx.runMutation(api.settings.settings_mutate.createAssignment, {
        courseId,
        name: name,
        assignment_type: assignment_type,
        start_date_ms: startDt.toMillis(),
        end_date_ms: endDt.toMillis(),
      });
    }

    return new Response(null, {
      status: 200,
      headers: createCorsHeaders(),
    });
  }),
});

// OPTIONS handler for upload_tas_csv
http.route({
  path: `${API_PREFIX}/upload_tas_csv`,
  method: 'OPTIONS',
  handler: httpAction(async () => handlePreflight()),
});

http.route({
  path: `${API_PREFIX}/upload_tas_csv`,
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
    const user = await getAuthUserId(ctx);

    if (!user) {
      throw new Error('User not authenticated');
    }

    const courseId = getCourseIdFromRequest(request);

    // ensure user is a TA
    const is_ta = await ctx.runQuery(internal.common.internalEnsureTAOrOwner, {
      user_id: user,
      courseId,
    });

    if (!is_ta) {
      throw new Error('User is not a TA or Owner');
    }

    const blob = await request.blob();
    const csvData = await blob.text();

    const csvRows = await ctx.runAction(internal.actions.parseCsvNode, {
      csvText: csvData,
    });

    for (const ta of csvRows) {
      const name = ta.name;
      const email = ta.email;
      const is_admin = ta.is_admin.toLowerCase() === 'true';

      await ctx.runMutation(api.settings.settings_mutate.createTA, {
        courseId,
        name: name,
        email: email,
        isAdmin: is_admin,
      });
    }

    return new Response(null, {
      status: 200,
      headers: createCorsHeaders(),
    });
  }),
});

// OPTIONS handler for upload_access_control_csv
http.route({
  path: `${API_PREFIX}/upload_access_control_csv`,
  method: 'OPTIONS',
  handler: httpAction(async () => handlePreflight()),
});

http.route({
  path: `${API_PREFIX}/upload_access_control_csv`,
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
    const user = await getAuthUserId(ctx);

    if (!user) {
      throw new Error('User not authenticated');
    }

    const courseId = getCourseIdFromRequest(request);

    // ensure user is a TA
    const is_ta = await ctx.runQuery(internal.common.internalEnsureTA, {
      user_id: user,
      courseId,
    });

    if (!is_ta) {
      throw new Error('User is not a TA');
    }

    const blob = await request.blob();
    const csvData = await blob.text();

    const csvRows = await ctx.runAction(internal.actions.parseCsvNode, {
      csvText: csvData,
    });

    for (const acl_entry of csvRows) {
      const email = acl_entry.email;
      const is_whitelisted = acl_entry.is_whitelisted.toLowerCase() === 'true';
      const is_blacklisted = acl_entry.is_blacklisted.toLowerCase() === 'true';

      if (is_whitelisted && is_blacklisted) {
      }

      await ctx.runMutation(api.settings.settings_mutate.updateAccessControlledUser, {
        courseId,
        email: email,
        is_whitelisted: is_whitelisted,
        is_blacklisted: is_blacklisted,
      });
    }

    return new Response(null, {
      status: 200,
      headers: createCorsHeaders(),
    });
  }),
});

/**
 * Per-course theme CSS. Returns a single :root rule with the course's
 * configured primary + secondary colors (or the defaults if unset).
 *
 * Mounted at /_theme/<slug>.css. The `index.html` bootstrap synchronously
 * injects a <link rel="stylesheet"> pointing here whenever a slug is
 * present in the URL — that link is render-blocking by default, so the
 * browser delays first paint until the colors arrive. No FOUC even on a
 * first-ever visit.
 */
const DEFAULT_PRIMARY = '#14532D';
const DEFAULT_SECONDARY = '#EAB308';

http.route({
  pathPrefix: '/_theme/',
  method: 'GET',
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const filename = url.pathname.replace(/^\/_theme\//, '');
    const slug = filename.replace(/\.css$/, '');

    let primary = DEFAULT_PRIMARY;
    let secondary = DEFAULT_SECONDARY;

    if (slug && /^[a-z0-9-]+$/.test(slug)) {
      const course = await ctx.runQuery(api.courses.getCourseBySlug, { slug });
      if (course) {
        const settings = await ctx.runQuery(internal.common.internalGetGlobalSettings, {
          courseId: course._id,
        });
        if (settings.theme_primary && HEX_COLOR.test(settings.theme_primary)) {
          primary = settings.theme_primary;
        }
        if (settings.theme_secondary && HEX_COLOR.test(settings.theme_secondary)) {
          secondary = settings.theme_secondary;
        }
      }
    }

    const css = `:root{--ohq-course-primary:${primary};--ohq-course-secondary:${secondary};}\n`;

    return new Response(css, {
      status: 200,
      headers: {
        'Content-Type': 'text/css; charset=utf-8',
        // Short cache so admin color changes propagate within a minute.
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }),
});

export default http;
