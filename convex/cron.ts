import { cronJobs } from 'convex/server';
import { internal } from './_generated/api';

const crons = cronJobs();

crons.interval(
  'send waittimes slackbot ping',
  { minutes: 1 },
  internal.home.home_mutate.internalWaittimeIntervalCheck
);
