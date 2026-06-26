'use node';

import { ConvexError, v } from 'convex/values';
import { internalAction } from './_generated/server';
import csv from 'csvtojson';
import { internal } from './_generated/api';

const SlackWebhook = require('slack-webhook');

export const parseCsvNode = internalAction({
  args: { csvText: v.string() },
  handler: async (ctx, args) => {
    return await csv().fromString(args.csvText);
  },
});

export const sendSlackbotMessage = internalAction({
  args: {
    courseId: v.id('courses'),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const globalSettings = await ctx.runQuery(internal.common.internalGetGlobalSettings, {
      courseId: args.courseId,
    });

    if (!globalSettings.slackbot_webhook_url) {
      throw new ConvexError('Slackbot webhook URL not found');
    }

    const slack = new SlackWebhook(globalSettings.slackbot_webhook_url, {
      defaults: {
        username: 'QueueBot',
      },
    });

    if (slack) {
      slack.send(args.message);
    }
  },
});
