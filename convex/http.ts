import { httpRouter } from 'convex/server';
import { httpAction, internalMutation } from './_generated/server';
import { api, internal } from './_generated/api';
import { getCurrentSemester } from './common';
import { ConvexError, v } from 'convex/values';
import { auth } from './auth';
import { getAuthUserId } from '@convex-dev/auth/server';

const http = httpRouter();

auth.addHttpRoutes(http);

// Helper function to create CORS headers
function createCorsHeaders(additionalHeaders: Record<string, string> = {}) {
  const origin = process.env.CLIENT_ORIGIN || '*';
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400', // 24 hours
    ...additionalHeaders,
  };
}

// Helper function to handle preflight requests
function handlePreflight() {
  return new Response(null, {
    status: 204,
    headers: createCorsHeaders(),
  });
}

// OPTIONS handler for download_assignment_csv
http.route({
  path: '/download_assignment_csv',
  method: 'OPTIONS',
  handler: httpAction(async () => handlePreflight()),
});

http.route({
  path: '/download_assignment_csv',
  method: 'GET',
  handler: httpAction(async (ctx, request) => {
    const user = await getAuthUserId(ctx);

    if (!user) {
      throw new Error('User not authenticated');
    }

    // ensure user is a TA
    const is_ta = await ctx.runQuery(internal.common.internalEnsureTA, {
      user_id: user,
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
  path: '/download_tas_csv',
  method: 'OPTIONS',
  handler: httpAction(async () => handlePreflight()),
});

http.route({
  path: '/download_tas_csv',
  method: 'GET',
  handler: httpAction(async (ctx, request) => {
    const user = await getAuthUserId(ctx);

    if (!user) {
      throw new Error('User not authenticated');
    }

    // ensure user is a TA
    const is_ta = await ctx.runQuery(internal.common.internalEnsureTA, {
      user_id: user,
    });

    if (!is_ta) {
      throw new Error('User is not a TA');
    }

    const csvContent = [
      'name,email,is_admin',
      'Example TA,ta@andrew.cmu.edu,false',
    ].join('\n');

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
  path: '/download_access_control_csv',
  method: 'OPTIONS',
  handler: httpAction(async () => handlePreflight()),
});

http.route({
  path: '/download_access_control_csv',
  method: 'GET',
  handler: httpAction(async (ctx, request) => {
    const user = await getAuthUserId(ctx);

    if (!user) {
      throw new Error('User not authenticated');
    }

    // ensure user is a TA
    const is_ta = await ctx.runQuery(internal.common.internalEnsureTA, {
      user_id: user,
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

// OPTIONS handler for upload_assignment_csv
http.route({
  path: '/upload_assignment_csv',
  method: 'OPTIONS',
  handler: httpAction(async () => handlePreflight()),
});

http.route({
  path: '/upload_assignment_csv',
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
    const user = await getAuthUserId(ctx);

    if (!user) {
      throw new Error('User not authenticated');
    }

    // ensure user is a TA
    const is_ta = await ctx.runQuery(internal.common.internalEnsureTA, {
      user_id: user,
    });

    if (!is_ta) {
      throw new Error('User is not a TA');
    }

    const blob = await request.blob();
    const csvData = await blob.text();

    const csvRows = await ctx.runAction(internal.actions.parseCsvNode, {
      csvText: csvData,
    });

    for (const assignment of csvRows) {
      const name = assignment.name;
      const assignment_type = assignment.assignment_type;
      const start_date = new Date(assignment.start_date);
      const end_date = new Date(assignment.end_date);

      await ctx.runMutation(api.settings.settings_mutate.createAssignment, {
        name: name,
        assignment_type: assignment_type,
        start_date_ms: start_date.getTime(),
        end_date_ms: end_date.getTime(),
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
  path: '/upload_tas_csv',
  method: 'OPTIONS',
  handler: httpAction(async () => handlePreflight()),
});

http.route({
  path: '/upload_tas_csv',
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
    const user = await getAuthUserId(ctx);

    if (!user) {
      throw new Error('User not authenticated');
    }

    // ensure user is a TA
    const is_ta = await ctx.runQuery(internal.common.internalEnsureTA, {
      user_id: user,
    });

    if (!is_ta) {
      throw new Error('User is not a TA');
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
  path: '/upload_access_control_csv',
  method: 'OPTIONS',
  handler: httpAction(async () => handlePreflight()),
});

http.route({
  path: '/upload_access_control_csv',
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
    const user = await getAuthUserId(ctx);

    if (!user) {
      throw new Error('User not authenticated');
    }

    // ensure user is a TA
    const is_ta = await ctx.runQuery(internal.common.internalEnsureTA, {
      user_id: user,
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

      await ctx.runMutation(
        api.settings.settings_mutate.updateAccessControlledUser,
        {
          email: email,
          is_whitelisted: is_whitelisted,
          is_blacklisted: is_blacklisted,
        }
      );
    }

    return new Response(null, {
      status: 200,
      headers: createCorsHeaders(),
    });
  }),
});

export default http;
