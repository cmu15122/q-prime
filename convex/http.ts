import { httpRouter } from "convex/server";
import { httpAction, internalMutation } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { getCurrentSemester } from "./common";
import { ConvexError, v } from "convex/values";
import { auth } from "./auth";

const http = httpRouter();

auth.addHttpRoutes(http);

http.route({
  path: "/download_assignment_csv",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const user_identity = await ctx.auth.getUserIdentity();

    if (!user_identity) {
      throw new Error("User not authenticated");
    }

    if (!user_identity.email) {
      throw new Error("User email not found");
    }

    // ensure user is a TA
    const is_ta = await ctx.runQuery(internal.common.ensureEmailIsTA, {
      email: user_identity.email,
    });

    if (!is_ta) {
      throw new Error("User is not a TA");
    }

    const csvContent = [
      "name,assignment_type,start_date,end_date",
      "Example Written,Written,8/5/22 9:00 PM,8/12/22 9:00 PM",
    ].join("\n");

    return new Response(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="assignments_example.csv"`,
      },
    });
  }),
});

http.route({
  path: "/download_tas_csv",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const user_identity = await ctx.auth.getUserIdentity();

    if (!user_identity) {
      throw new Error("User not authenticated");
    }

    if (!user_identity.email) {
      throw new Error("User email not found");
    }

    // ensure user is a TA
    const is_ta = await ctx.runQuery(internal.common.ensureEmailIsTA, {
      email: user_identity.email,
    });

    if (!is_ta) {
      throw new Error("User is not a TA");
    }

    const csvContent = [
      "name,email,is_admin",
      "Example TA,ta@andrew.cmu.edu,false",
    ].join("\n");

    return new Response(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="tas_example.csv"`,
      },
    });
  }),
});

http.route({
  path: "/download_access_control_csv",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const user_identity = await ctx.auth.getUserIdentity();

    if (!user_identity) {
      throw new Error("User not authenticated");
    }

    if (!user_identity.email) {
      throw new Error("User email not found");
    }

    // ensure user is a TA
    const is_ta = await ctx.runQuery(internal.common.ensureEmailIsTA, {
      email: user_identity.email,
    });

    if (!is_ta) {
      throw new Error("User is not a TA");
    }

    const csvContent = [
      "email,is_whitelisted,is_blacklisted",
      "example@andrew.cmu.edu,false,false",
    ].join("\n");

    return new Response(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="access_control_template.csv"`,
      },
    });
  }),
});

http.route({
  path: "/upload_assignment_csv",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const user_identity = await ctx.auth.getUserIdentity();

    if (!user_identity) {
      throw new Error("User not authenticated");
    }

    if (!user_identity.email) {
      throw new Error("User email not found");
    }

    // ensure user is a TA
    const is_ta = await ctx.runQuery(internal.common.ensureEmailIsTA, {
      email: user_identity.email,
    });

    if (!is_ta) {
      throw new Error("User is not a TA");
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
    });
  }),
});

http.route({
  path: "/upload_tas_csv",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const user_identity = await ctx.auth.getUserIdentity();

    if (!user_identity) {
      throw new Error("User not authenticated");
    }

    if (!user_identity.email) {
      throw new Error("User email not found");
    }

    // ensure user is a TA
    const is_ta = await ctx.runQuery(internal.common.ensureEmailIsTA, {
      email: user_identity.email,
    });

    if (!is_ta) {
      throw new Error("User is not a TA");
    }

    const blob = await request.blob();
    const csvData = await blob.text();

    const csvRows = await ctx.runAction(internal.actions.parseCsvNode, {
      csvText: csvData,
    });

    for (const ta of csvRows) {
      const name = ta.name;
      const email = ta.email;
      const is_admin = ta.is_admin;

      await ctx.runMutation(api.settings.settings_mutate.createTA, {
        name: name,
        email: email,
        isAdmin: is_admin,
      });
    }

    return new Response(null, {
      status: 200,
    });
  }),
});

http.route({
  path: "/upload_access_control_csv",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const user_identity = await ctx.auth.getUserIdentity();

    if (!user_identity) {
      throw new Error("User not authenticated");
    }

    if (!user_identity.email) {
      throw new Error("User email not found");
    }

    // ensure user is a TA
    const is_ta = await ctx.runQuery(internal.common.ensureEmailIsTA, {
      email: user_identity.email,
    });

    if (!is_ta) {
      throw new Error("User is not a TA");
    }

    const blob = await request.blob();
    const csvData = await blob.text();

    const csvRows = await ctx.runAction(internal.actions.parseCsvNode, {
      csvText: csvData,
    });

    for (const acl_entry of csvRows) {
      const email = acl_entry.email;
      const is_whitelisted = acl_entry.is_whitelisted.toLowerCase() === "true";
      const is_blacklisted = acl_entry.is_blacklisted.toLowerCase() === "true";

      if (is_whitelisted && is_blacklisted) {
      }

      await ctx.runMutation(
        api.settings.settings_mutate.updateAccessControlledUser,
        {
          email: email,
          is_whitelisted: is_whitelisted,
          is_blacklisted: is_blacklisted,
        },
      );
    }

    return new Response(null, {
      status: 200,
    });
  }),
});

export default http;
