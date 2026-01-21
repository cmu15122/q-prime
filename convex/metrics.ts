import { query } from './_generated/server';
import { v } from 'convex/values';
import {
  ensureAuthAndAdmin,
  ensureAuthAndTA,
  getCurrentSemester,
  getGlobalSettings,
} from './common';
import { Id } from './_generated/dataModel';
import { getZoneDayBounds, getZoneDayKey, getZoneDayOfWeek } from './util/time';

/**
 * Helper to calculate GCD for ratio
 */
function gcd(a: number, b: number): number {
  return b ? gcd(b, a % b) : a;
}

function reduceRatio(numerator: number, denominator: number) {
  if (denominator === 0) {
    return [0, 0];
  }
  const divisor = gcd(numerator, denominator);
  return [numerator / divisor, denominator / divisor];
}

const dayCountValidator = v.object({
  day: v.string(),
  students: v.number(),
});

/**
 * Get list of students helped by the current TA
 */
export const getHelpedStudents = query({
  args: {},
  returns: v.object({
    helpedStudents: v.array(
      v.object({
        student_name: v.string(),
        student_email: v.string(),
        start_date: v.string(),
        end_date: v.string(),
        question: v.string(),
      }),
    ),
  }),
  handler: async (ctx) => {
    const { ta } = await ensureAuthAndTA(ctx);
    const curr_sem = await getCurrentSemester(ctx);

    const questions = await ctx.db
      .query('questions')
      .withIndex('by_semester_and_finished_by_and_ta', (q) =>
        q.eq('semester_id', curr_sem._id).eq('finished_by', 'helped').eq('ta_id', ta._id),
      )
      .collect();

    // sort by entry_time descending (matching metrics.js: order: [['entry_time', 'DESC']])
    questions.sort((a, b) => b.entry_time_ms - a.entry_time_ms);

    const helpedStudents = await Promise.all(
      questions.map(async (q) => {
        const student = (await ctx.db.get(q.student_id))!;
        let student_name = '';

        const user_prefs = (await ctx.db.get(student.user_prefs_id))!;
        const user = (await ctx.db.get(student.user_id))!;

        student_name = user_prefs.preferred_name;

        const help_start_ms = q.exit_time_ms - q.help_duration_ms;

        return {
          student_name,
          student_email: user.email!,
          start_date: new Date(help_start_ms).toISOString(),
          end_date: new Date(q.exit_time_ms).toISOString(),
          question: q.question,
        };
      }),
    );

    return { helpedStudents };
  },
});

/**
 * Get number of questions answered by the current TA
 */
export const getNumQuestionsAnswered = query({
  args: {},
  returns: v.object({
    numQuestions: v.number(),
  }),
  handler: async (ctx) => {
    const { ta } = await ensureAuthAndTA(ctx);
    const curr_sem = await getCurrentSemester(ctx);

    const questions = await ctx.db
      .query('questions')
      .withIndex('by_semester_and_finished_by_and_ta', (q) =>
        q.eq('semester_id', curr_sem._id).eq('finished_by', 'helped').eq('ta_id', ta._id),
      )
      .collect();

    return { numQuestions: questions.length };
  },
});

/**
 * Get average time per question for the current TA
 */
export const getAverageTimePerQuestion = query({
  args: {},
  returns: v.object({
    averageTime: v.number(),
  }),
  handler: async (ctx) => {
    const { ta } = await ensureAuthAndTA(ctx);
    const curr_sem = await getCurrentSemester(ctx);

    const questions = await ctx.db
      .query('questions')
      .withIndex('by_semester_and_finished_by_and_ta', (q) =>
        q.eq('semester_id', curr_sem._id).eq('finished_by', 'helped').eq('ta_id', ta._id),
      )
      .collect();

    let totalTime = 0;
    for (const q of questions) {
      totalTime += q.help_duration_ms / 1000 / 60; // minutes
    }

    const averageTime = questions.length > 0 ? totalTime / questions.length : 0;

    return { averageTime };
  },
});

/**
 * Get number of questions answered today (for all TAs)
 */
export const getNumQuestionsToday = query({
  args: {},
  returns: v.object({
    numQuestionsToday: v.number(),
  }),
  handler: async (ctx) => {
    await ensureAuthAndTA(ctx);
    const curr_sem = await getCurrentSemester(ctx);
    const settings = await getGlobalSettings(ctx);
    const timezone = settings.timezone;

    const { startMs, endMs } = getZoneDayBounds(Date.now(), timezone);

    const questions = await ctx.db
      .query('questions')
      .withIndex('by_semester_and_entry_time_ms', (q) =>
        q.eq('semester_id', curr_sem._id).gte('entry_time_ms', startMs).lte('entry_time_ms', endMs),
      )
      .collect();

    return { numQuestionsToday: questions.length };
  },
});

/**
 * Get number of "bad" questions (asked to fix) today
 */
export const getNumBadQuestionsToday = query({
  args: {},
  returns: v.object({
    numBadQuestionsToday: v.number(),
  }),
  handler: async (ctx) => {
    await ensureAuthAndTA(ctx);
    const curr_sem = await getCurrentSemester(ctx);
    const settings = await getGlobalSettings(ctx);
    const timezone = settings.timezone;

    const { startMs, endMs } = getZoneDayBounds(Date.now(), timezone);

    const questions = await ctx.db
      .query('questions')
      .withIndex('by_semester_and_entry_time_ms', (q) =>
        q.eq('semester_id', curr_sem._id).gte('entry_time_ms', startMs).lte('entry_time_ms', endMs),
      )
      .collect();

    const numBadQuestionsToday = questions.reduce((count, q) => {
      if (q.num_asked_to_fix > 0) {
        return count + 1;
      }
      return count;
    }, 0);

    return { numBadQuestionsToday };
  },
});

/**
 * Get average wait time for questions answered today
 */
export const getAvgWaitTimeToday = query({
  args: {},
  returns: v.object({
    avgWaitTime: v.number(),
  }),
  handler: async (ctx) => {
    await ensureAuthAndTA(ctx);
    const curr_sem = await getCurrentSemester(ctx);
    const settings = await getGlobalSettings(ctx);
    const timezone = settings.timezone;

    const { startMs, endMs } = getZoneDayBounds(Date.now(), timezone);

    const questions = await ctx.db
      .query('questions')
      .withIndex('by_semester_and_entry_time_ms', (q) =>
        q.eq('semester_id', curr_sem._id).gte('entry_time_ms', startMs).lte('entry_time_ms', endMs),
      )
      .collect();

    let totalWaitTime = 0;
    let helpedCount = 0;
    for (const q of questions) {
      if (q.finished_by !== 'helped') {
        continue;
      }
      const helpStartMs = q.exit_time_ms - q.help_duration_ms;
      totalWaitTime += (helpStartMs - q.entry_time_ms) / 1000 / 60;
      helpedCount += 1;
    }

    const avgWaitTime = helpedCount > 0 ? totalWaitTime / helpedCount : 0;

    return { avgWaitTime };
  },
});

/**
 * Get TA:Student ratio today
 */
export const getTaStudentRatioToday = query({
  args: {},
  returns: v.object({
    taStudentRatio: v.string(),
  }),
  handler: async (ctx) => {
    await ensureAuthAndTA(ctx);
    const curr_sem = await getCurrentSemester(ctx);
    const settings = await getGlobalSettings(ctx);
    const timezone = settings.timezone;

    const { startMs, endMs } = getZoneDayBounds(Date.now(), timezone);

    const questions = await ctx.db
      .query('questions')
      .withIndex('by_semester_and_entry_time_ms', (q) =>
        q.eq('semester_id', curr_sem._id).gte('entry_time_ms', startMs).lte('entry_time_ms', endMs),
      )
      .collect();

    const taIds = new Set<string>();
    const studentIds = new Set<string>();

    for (const q of questions) {
      if (q.ta_id) taIds.add(q.ta_id);
      studentIds.add(q.student_id);
    }

    const ratio = reduceRatio(taIds.size, studentIds.size);

    return { taStudentRatio: `${ratio[0]}:${ratio[1]}` };
  },
});

/**
 * Get total number of questions answered in semester
 */
export const getTotalNumQuestions = query({
  args: {},
  returns: v.object({
    numQuestions: v.number(),
  }),
  handler: async (ctx) => {
    await ensureAuthAndTA(ctx);
    const curr_sem = await getCurrentSemester(ctx);

    const questions = await ctx.db
      .query('questions')
      .withIndex('by_semester_and_finished_by_and_ta', (q) =>
        q.eq('semester_id', curr_sem._id).eq('finished_by', 'helped'),
      )
      .collect();

    return { numQuestions: questions.length };
  },
});

/**
 * Get total average time per question in semester
 */
export const getTotalAvgTimePerQuestion = query({
  args: {},
  returns: v.object({
    averageTime: v.number(),
  }),
  handler: async (ctx) => {
    await ensureAuthAndTA(ctx);
    const curr_sem = await getCurrentSemester(ctx);

    const questions = await ctx.db
      .query('questions')
      .withIndex('by_semester_and_finished_by_and_ta', (q) =>
        q.eq('semester_id', curr_sem._id).eq('finished_by', 'helped'),
      )
      .collect();

    let totalTime = 0;
    for (const q of questions) {
      totalTime += q.help_duration_ms / 1000 / 60;
    }

    const averageTime = questions.length > 0 ? totalTime / questions.length : 0;

    return { averageTime };
  },
});

/**
 * Get total average wait time in semester
 */
export const getTotalAvgWaitTime = query({
  args: {},
  returns: v.object({
    totalAvgWaitTime: v.number(),
  }),
  handler: async (ctx) => {
    await ensureAuthAndTA(ctx);
    const curr_sem = await getCurrentSemester(ctx);

    const questions = await ctx.db
      .query('questions')
      .withIndex('by_semester_and_finished_by_and_ta', (q) =>
        q.eq('semester_id', curr_sem._id).eq('finished_by', 'helped'),
      )
      .collect();

    let totalWaitTime = 0;
    for (const q of questions) {
      const helpStartMs = q.exit_time_ms - q.help_duration_ms;
      totalWaitTime += (helpStartMs - q.entry_time_ms) / 1000 / 60;
    }

    const totalAvgWaitTime = questions.length > 0 ? totalWaitTime / questions.length : 0;

    return { totalAvgWaitTime };
  },
});

/**
 * Get number of students per day for the last week
 */
export const getNumStudentsPerDayLastWeek = query({
  args: {},
  returns: v.object({
    numStudentsPerDayLastWeek: v.array(dayCountValidator),
  }),
  handler: async (ctx) => {
    await ensureAuthAndTA(ctx);
    const curr_sem = await getCurrentSemester(ctx);
    const settings = await getGlobalSettings(ctx);
    const timezone = settings.timezone;

    const sevenDaysAgoMs = Date.now() - 7 * 24 * 60 * 60 * 1000;

    const questions = await ctx.db
      .query('questions')
      .withIndex('by_semester_and_entry_time_ms', (q) =>
        q.eq('semester_id', curr_sem._id).gte('entry_time_ms', sevenDaysAgoMs),
      )
      .collect();

    const counts: Record<string, number> = {};

    for (const q of questions) {
      if (q.finished_by !== 'helped') {
        continue;
      }
      // Use YYYY-MM-DD format as key
      const date = getZoneDayKey(q.entry_time_ms, timezone);
      counts[date] = (counts[date] || 0) + 1;
    }

    const numStudentsPerDayLastWeek = Object.keys(counts)
      .map((day) => ({ day, students: counts[day] }))
      .sort((a, b) => a.day.localeCompare(b.day));

    return { numStudentsPerDayLastWeek };
  },
});

/**
 * Get number of students per day of the week (overall)
 */
export const getNumStudentsPerDay = query({
  args: {},
  returns: v.object({
    numStudentsPerDay: v.array(dayCountValidator),
  }),
  handler: async (ctx) => {
    await ensureAuthAndTA(ctx);
    const curr_sem = await getCurrentSemester(ctx);
    const settings = await getGlobalSettings(ctx);
    const timezone = settings.timezone;

    const questions = await ctx.db
      .query('questions')
      .withIndex('by_semester_and_finished_by_and_ta', (q) =>
        q.eq('semester_id', curr_sem._id).eq('finished_by', 'helped'),
      )
      .collect();

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const counts: Record<string, number> = {};

    for (const q of questions) {
      const dayIndex = getZoneDayOfWeek(q.entry_time_ms, timezone);
      const dayName = days[dayIndex];
      counts[dayName] = (counts[dayName] || 0) + 1;
    }

    const numStudentsPerDay = Object.keys(counts).map((day) => ({
      day,
      students: counts[day],
    }));
    // Note: sorting is done in client in original code, but we can return unsorted

    return { numStudentsPerDay };
  },
});

/**
 * Get number of students per day overall
 */
export const getNumStudentsOverall = query({
  args: {},
  returns: v.object({
    numStudentsOverall: v.array(dayCountValidator),
  }),
  handler: async (ctx) => {
    await ensureAuthAndTA(ctx);
    const curr_sem = await getCurrentSemester(ctx);
    const settings = await getGlobalSettings(ctx);
    const timezone = settings.timezone;

    const questions = await ctx.db
      .query('questions')
      .withIndex('by_semester_and_finished_by_and_ta', (q) =>
        q.eq('semester_id', curr_sem._id).eq('finished_by', 'helped'),
      )
      .collect();

    const counts: Record<string, number> = {};

    for (const q of questions) {
      const date = getZoneDayKey(q.entry_time_ms, timezone);
      counts[date] = (counts[date] || 0) + 1;
    }

    const numStudentsOverall = Object.keys(counts)
      .map((day) => ({ day, students: counts[day] }))
      .sort((a, b) => a.day.localeCompare(b.day));

    return { numStudentsOverall };
  },
});

/**
 * Get ranked students (Admin only)
 */
export const getRankedStudents = query({
  args: {},
  returns: v.object({
    rankedStudents: v.array(
      v.object({
        student_name: v.string(),
        student_email: v.string(),
        count: v.number(),
        badCount: v.number(),
        timeHelped: v.number(),
      }),
    ),
  }),
  handler: async (ctx) => {
    await ensureAuthAndAdmin(ctx);
    const curr_sem = await getCurrentSemester(ctx);

    const questions = await ctx.db
      .query('questions')
      .withIndex('by_semester_and_finished_by_and_ta', (q) =>
        q.eq('semester_id', curr_sem._id).eq('finished_by', 'helped'),
      )
      .collect();

    const studentMap: Record<string, { count: number; timeHelped: number; badCount: number }> = {};

    for (const q of questions) {
      if (!studentMap[q.student_id]) {
        studentMap[q.student_id] = { count: 0, timeHelped: 0, badCount: 0 };
      }
      studentMap[q.student_id].count++;
      studentMap[q.student_id].timeHelped += q.help_duration_ms / 1000 / 60;
      studentMap[q.student_id].badCount += q.num_asked_to_fix;
    }

    const rankedStudents = await Promise.all(
      Object.keys(studentMap).map(async (student_id) => {
        const stats = studentMap[student_id];
        const student = (await ctx.db.get(student_id as Id<'students'>))!;
        let student_name = '';

        const user_prefs = (await ctx.db.get(student.user_prefs_id))!;
        const user = (await ctx.db.get(student.user_id))!;

        student_name = user_prefs.preferred_name;

        return {
          student_name,
          student_email: user.email!,
          count: stats.count,
          badCount: stats.badCount,
          timeHelped: Math.round(stats.timeHelped * 10) / 10,
        };
      }),
    );

    rankedStudents.sort((a, b) => {
      if (a.count !== b.count) {
        return b.count - a.count;
      } else {
        return b.timeHelped - a.timeHelped;
      }
    });

    return { rankedStudents };
  },
});

/**
 * Get ranked TAs (Admin only)
 */
export const getRankedTAs = query({
  args: {},
  returns: v.object({
    rankedTAs: v.array(
      v.object({
        ta_name: v.string(),
        ta_email: v.string(),
        count: v.number(),
        timeHelping: v.number(),
      }),
    ),
  }),
  handler: async (ctx) => {
    await ensureAuthAndAdmin(ctx);
    const curr_sem = await getCurrentSemester(ctx);

    const questions = await ctx.db
      .query('questions')
      .withIndex('by_semester_and_finished_by_and_ta', (q) =>
        q.eq('semester_id', curr_sem._id).eq('finished_by', 'helped'),
      )
      .collect();

    const taMap: Record<string, { count: number; timeHelping: number }> = {};

    for (const q of questions) {
      if (!q.ta_id) continue;

      if (!taMap[q.ta_id]) {
        taMap[q.ta_id] = { count: 0, timeHelping: 0 };
      }
      taMap[q.ta_id].count++;
      taMap[q.ta_id].timeHelping += q.help_duration_ms / 1000 / 60;
    }

    const rankedTAs = await Promise.all(
      Object.keys(taMap).map(async (ta_id) => {
        const stats = taMap[ta_id];
        const ta = (await ctx.db.get(ta_id as Id<'tas'>))!;

        const user_prefs = (await ctx.db.get(ta.user_prefs_id))!;
        const user = (await ctx.db.get(ta.user_id))!;

        return {
          ta_name: user_prefs.preferred_name,
          ta_email: user.email!,
          count: stats.count,
          timeHelping: Math.round(stats.timeHelping * 10) / 10,
        };
      }),
    );

    rankedTAs.sort((a, b) => {
      if (a.count !== b.count) {
        return b.count - a.count;
      } else {
        return b.timeHelping - a.timeHelping;
      }
    });

    return { rankedTAs };
  },
});
