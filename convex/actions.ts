"use node";

import { v } from "convex/values";
import { action, internalAction } from "./_generated/server";
import csv from "csvtojson";

export const parseCsvNode = internalAction({
  args: { csvText: v.string() },
  handler: async (ctx, args) => {
    return await csv().fromString(args.csvText);
  },
});
