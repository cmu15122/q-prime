import { internalQuery, query } from './_generated/server';
import { ConvexError, v } from 'convex/values';
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

function formatMinutes(num: number): string {
  const minutes = Math.floor(num);
  const seconds = Math.round((num - minutes) * 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Get list of students helped by the current TA
 */
export const getHelpedStudents = query({
  args: { courseId: v.id('courses') },
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
  handler: async (ctx, args) => {
    const { ta } = await ensureAuthAndTA(ctx, args.courseId);
    const curr_sem = await getCurrentSemester(ctx, args.courseId);

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
  args: { courseId: v.id('courses') },
  returns: v.object({
    numQuestions: v.number(),
  }),
  handler: async (ctx, args) => {
    const { ta } = await ensureAuthAndTA(ctx, args.courseId);
    const curr_sem = await getCurrentSemester(ctx, args.courseId);

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
  args: { courseId: v.id('courses') },
  returns: v.object({
    averageTime: v.string(),
  }),
  handler: async (ctx, args) => {
    const { ta } = await ensureAuthAndTA(ctx, args.courseId);
    const curr_sem = await getCurrentSemester(ctx, args.courseId);

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

    return { averageTime: formatMinutes(averageTime) };
  },
});

/**
 * Get number of questions answered today (for all TAs)
 */
export const getNumQuestionsToday = query({
  args: { courseId: v.id('courses') },
  returns: v.object({
    numQuestionsToday: v.number(),
  }),
  handler: async (ctx, args) => {
    await ensureAuthAndTA(ctx, args.courseId);
    const curr_sem = await getCurrentSemester(ctx, args.courseId);
    const settings = await getGlobalSettings(ctx, args.courseId);
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
  args: { courseId: v.id('courses') },
  returns: v.object({
    numBadQuestionsToday: v.number(),
  }),
  handler: async (ctx, args) => {
    await ensureAuthAndTA(ctx, args.courseId);
    const curr_sem = await getCurrentSemester(ctx, args.courseId);
    const settings = await getGlobalSettings(ctx, args.courseId);
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
  args: { courseId: v.id('courses') },
  returns: v.object({
    avgWaitTime: v.string(),
  }),
  handler: async (ctx, args) => {
    await ensureAuthAndTA(ctx, args.courseId);
    const curr_sem = await getCurrentSemester(ctx, args.courseId);
    const settings = await getGlobalSettings(ctx, args.courseId);
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

    return { avgWaitTime: formatMinutes(avgWaitTime) };
  },
});

/**
 * Get TA:Student ratio today
 */
export const getTaStudentRatioToday = query({
  args: { courseId: v.id('courses') },
  returns: v.object({
    taStudentRatio: v.string(),
  }),
  handler: async (ctx, args) => {
    await ensureAuthAndTA(ctx, args.courseId);
    const curr_sem = await getCurrentSemester(ctx, args.courseId);
    const settings = await getGlobalSettings(ctx, args.courseId);
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
  args: { courseId: v.id('courses') },
  returns: v.object({
    numQuestions: v.number(),
  }),
  handler: async (ctx, args) => {
    await ensureAuthAndTA(ctx, args.courseId);
    const curr_sem = await getCurrentSemester(ctx, args.courseId);

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
  args: { courseId: v.id('courses') },
  returns: v.object({
    averageTime: v.string(),
  }),
  handler: async (ctx, args) => {
    await ensureAuthAndTA(ctx, args.courseId);
    const curr_sem = await getCurrentSemester(ctx, args.courseId);

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

    return { averageTime: formatMinutes(averageTime) };
  },
});

/**
 * Get total average wait time in semester
 */
export const getTotalAvgWaitTime = query({
  args: { courseId: v.id('courses') },
  returns: v.object({
    totalAvgWaitTime: v.string(),
  }),
  handler: async (ctx, args) => {
    await ensureAuthAndTA(ctx, args.courseId);
    const curr_sem = await getCurrentSemester(ctx, args.courseId);

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

    return { totalAvgWaitTime: formatMinutes(totalAvgWaitTime) };
  },
});

/**
 * Get number of students per day for the last week
 */
export const getNumStudentsPerDayLastWeek = query({
  args: { courseId: v.id('courses') },
  returns: v.object({
    numStudentsPerDayLastWeek: v.array(dayCountValidator),
  }),
  handler: async (ctx, args) => {
    await ensureAuthAndTA(ctx, args.courseId);
    const curr_sem = await getCurrentSemester(ctx, args.courseId);
    const settings = await getGlobalSettings(ctx, args.courseId);
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
  args: { courseId: v.id('courses') },
  returns: v.object({
    numStudentsPerDay: v.array(dayCountValidator),
  }),
  handler: async (ctx, args) => {
    await ensureAuthAndTA(ctx, args.courseId);
    const curr_sem = await getCurrentSemester(ctx, args.courseId);
    const settings = await getGlobalSettings(ctx, args.courseId);
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
  args: { courseId: v.id('courses') },
  returns: v.object({
    numStudentsOverall: v.array(dayCountValidator),
  }),
  handler: async (ctx, args) => {
    await ensureAuthAndTA(ctx, args.courseId);
    const curr_sem = await getCurrentSemester(ctx, args.courseId);
    const settings = await getGlobalSettings(ctx, args.courseId);
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
  args: { courseId: v.id('courses') },
  returns: v.object({
    rankedStudents: v.array(
      v.object({
        student_id: v.id('students'),
        student_name: v.string(),
        student_email: v.string(),
        count: v.number(),
        badCount: v.number(),
        timeHelped: v.number(),
      }),
    ),
  }),
  handler: async (ctx, args) => {
    await ensureAuthAndAdmin(ctx, args.courseId);
    const curr_sem = await getCurrentSemester(ctx, args.courseId);

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
          student_id: student_id as Id<'students'>,
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
  args: { courseId: v.id('courses') },
  returns: v.object({
    rankedTAs: v.array(
      v.object({
        ta_id: v.id('tas'),
        ta_name: v.string(),
        ta_email: v.string(),
        count: v.number(),
        timeHelping: v.number(),
      }),
    ),
  }),
  handler: async (ctx, args) => {
    await ensureAuthAndAdmin(ctx, args.courseId);
    const curr_sem = await getCurrentSemester(ctx, args.courseId);

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
          ta_id: ta_id as Id<'tas'>,
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

/**
 * Get complete question history for a specific student (Admin only)
 * Returns null if student not found
 */
export const getStudentQuestionHistory = query({
  args: {
    courseId: v.id('courses'),
    studentId: v.id('students'),
  },
  returns: v.union(
    v.object({
      studentName: v.string(),
      studentEmail: v.string(),
      questions: v.array(
        v.object({
          question: v.string(),
          assignment_name: v.string(),
          location: v.string(),
          entry_time: v.string(),
          exit_time: v.string(),
          wait_time_mins: v.number(),
          help_duration_mins: v.number(),
          finished_by: v.string(),
          num_asked_to_fix: v.number(),
          ta_id: v.union(v.id('tas'), v.null()),
          ta_name: v.union(v.string(), v.null()),
        }),
      ),
      totalQuestions: v.number(),
      totalHelpedQuestions: v.number(),
      totalAskedToFix: v.number(),
      totalTimeHelped: v.string(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    await ensureAuthAndAdmin(ctx, args.courseId);

    const student = await ctx.db.get(args.studentId);
    if (!student) {
      return null;
    }

    // Tenant guard: confirm this student belongs to the current course's semester.
    // Without this, a course-A admin could read history for a course-B student.
    const student_sem_user = await ctx.db.get(student.semester_user_id);
    const curr_sem = await getCurrentSemester(ctx, args.courseId);
    if (!student_sem_user || student_sem_user.semester_id !== curr_sem._id) {
      return null;
    }

    const user_prefs = await ctx.db.get(student.user_prefs_id);
    const user = await ctx.db.get(student.user_id);
    if (!user_prefs || !user) {
      return null;
    }

    // Use the by_student_and_finished_by index - query all questions for this student
    const allQuestions = await ctx.db
      .query('questions')
      .withIndex('by_student_and_finished_by', (q) => q.eq('student_id', args.studentId))
      .collect();

    // Sort by entry time descending (most recent first)
    allQuestions.sort((a, b) => b.entry_time_ms - a.entry_time_ms);

    const questions = await Promise.all(
      allQuestions.map(async (q) => {
        const assignment = await ctx.db.get(q.assignment_id);

        let ta_name: string | null = null;
        if (q.ta_id) {
          const ta = await ctx.db.get(q.ta_id);
          if (ta) {
            const ta_prefs = await ctx.db.get(ta.user_prefs_id);
            if (ta_prefs) {
              ta_name = ta_prefs.preferred_name;
            }
          }
        }

        const helpStartMs = q.exit_time_ms - q.help_duration_ms;
        const waitTimeMins = (helpStartMs - q.entry_time_ms) / 1000 / 60;

        return {
          question: q.question,
          assignment_name: assignment?.name ?? 'Unknown',
          location: q.location,
          entry_time: new Date(q.entry_time_ms).toISOString(),
          exit_time: new Date(q.exit_time_ms).toISOString(),
          wait_time_mins: Math.round(waitTimeMins * 10) / 10,
          help_duration_mins:
            q.help_duration_ms >= 0 ? Math.round((q.help_duration_ms / 1000 / 60) * 10) / 10 : 0,
          finished_by: q.finished_by,
          num_asked_to_fix: q.num_asked_to_fix,
          ta_id: q.ta_id ?? null,
          ta_name,
        };
      }),
    );

    const totalAskedToFix = allQuestions.reduce((sum, q) => sum + q.num_asked_to_fix, 0);
    const totalTimeHelped = allQuestions.reduce(
      (sum, q) => sum + (q.finished_by === 'helped' ? q.help_duration_ms / 1000 / 60 : 0),
      0,
    );

    return {
      studentName: user_prefs.preferred_name,
      studentEmail: user.email!,
      questions,
      totalQuestions: allQuestions.length,
      totalHelpedQuestions: allQuestions.filter((q) => q.finished_by === 'helped').length,
      totalAskedToFix,
      totalTimeHelped: formatMinutes(totalTimeHelped),
    };
  },
});

/**
 * Get complete question history for a specific TA (Admin only)
 * Returns null if TA not found
 */
export const getTAQuestionHistory = query({
  args: {
    courseId: v.id('courses'),
    taId: v.id('tas'),
  },
  returns: v.union(
    v.object({
      taName: v.string(),
      taEmail: v.string(),
      questions: v.array(
        v.object({
          question: v.string(),
          assignment_name: v.string(),
          location: v.string(),
          student_id: v.id('students'),
          student_name: v.string(),
          student_email: v.string(),
          entry_time: v.string(),
          exit_time: v.string(),
          wait_time_mins: v.number(),
          help_duration_mins: v.number(),
          num_asked_to_fix: v.number(),
        }),
      ),
      totalQuestionsAnswered: v.number(),
      totalTimeHelping: v.string(),
      avgTimePerQuestion: v.string(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    await ensureAuthAndAdmin(ctx, args.courseId);
    const curr_sem = await getCurrentSemester(ctx, args.courseId);

    const ta = await ctx.db.get(args.taId);
    if (!ta) {
      return null;
    }

    // Tenant guard: confirm this TA belongs to the current course's semester.
    // Without this, a course-A admin could read history for a course-B TA.
    const ta_sem_user = await ctx.db.get(ta.semester_user_id);
    if (!ta_sem_user || ta_sem_user.semester_id !== curr_sem._id) {
      return null;
    }

    const user_prefs = await ctx.db.get(ta.user_prefs_id);
    const user = await ctx.db.get(ta.user_id);
    if (!user_prefs || !user) {
      return null;
    }

    // Use the by_semester_and_finished_by_and_ta index
    const allQuestions = await ctx.db
      .query('questions')
      .withIndex('by_semester_and_finished_by_and_ta', (q) =>
        q.eq('semester_id', curr_sem._id).eq('finished_by', 'helped').eq('ta_id', args.taId),
      )
      .collect();

    // Sort by entry time descending (most recent first)
    allQuestions.sort((a, b) => b.entry_time_ms - a.entry_time_ms);

    const questions = await Promise.all(
      allQuestions.map(async (q) => {
        const assignment = await ctx.db.get(q.assignment_id);
        const student = await ctx.db.get(q.student_id);

        let student_name = 'Unknown';
        let student_email = 'Unknown';
        if (student) {
          const student_prefs = await ctx.db.get(student.user_prefs_id);
          const student_user = await ctx.db.get(student.user_id);
          if (student_prefs) {
            student_name = student_prefs.preferred_name;
          }
          if (student_user) {
            student_email = student_user.email!;
          }
        }

        const helpStartMs = q.exit_time_ms - q.help_duration_ms;
        const waitTimeMins = (helpStartMs - q.entry_time_ms) / 1000 / 60;

        return {
          question: q.question,
          assignment_name: assignment?.name ?? 'Unknown',
          location: q.location,
          student_id: q.student_id,
          student_name,
          student_email,
          entry_time: new Date(q.entry_time_ms).toISOString(),
          exit_time: new Date(q.exit_time_ms).toISOString(),
          wait_time_mins: Math.round(waitTimeMins * 10) / 10,
          help_duration_mins: Math.round((q.help_duration_ms / 1000 / 60) * 10) / 10,
          num_asked_to_fix: q.num_asked_to_fix,
        };
      }),
    );

    const totalTimeHelping = allQuestions.reduce(
      (sum, q) => sum + q.help_duration_ms / 1000 / 60,
      0,
    );

    const avgTimePerQuestion = allQuestions.length > 0 ? totalTimeHelping / allQuestions.length : 0;

    return {
      taName: user_prefs.preferred_name,
      taEmail: user.email!,
      questions,
      totalQuestionsAnswered: allQuestions.length,
      totalTimeHelping: formatMinutes(totalTimeHelping),
      avgTimePerQuestion: formatMinutes(avgTimePerQuestion),
    };
  },
});

/**
 * Admin-only dump of every question in the current semester, joined with
 * student/TA/assignment names + emails so the CSV is usable standalone.
 * Called from the /api/download_questions_csv httpAction.
 */
export const internalGetQuestionsCsvDump = internalQuery({
  args: {
    user_id: v.id('users'),
    courseId: v.id('courses'),
  },
  returns: v.object({
    semesterName: v.string(),
    rows: v.array(
      v.object({
        question_id: v.id('questions'),
        semester_id: v.id('semesters'),
        semester_name: v.string(),
        assignment_id: v.id('assignments'),
        assignment_name: v.string(),
        student_id: v.id('students'),
        student_name: v.string(),
        student_email: v.string(),
        ta_id: v.string(),
        ta_name: v.string(),
        ta_email: v.string(),
        question: v.string(),
        location: v.string(),
        created_by: v.string(),
        finished_by: v.string(),
        entry_time_ms: v.number(),
        entry_time_iso: v.string(),
        exit_time_ms: v.number(),
        exit_time_iso: v.string(),
        help_duration_ms: v.number(),
        num_asked_to_fix: v.number(),
      }),
    ),
  }),
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.user_id);
    if (!user) {
      throw new ConvexError('User not authenticated');
    }

    const curr_sem = await getCurrentSemester(ctx, args.courseId);

    const sem_user = await ctx.db
      .query('semesterUsers')
      .withIndex('by_sem_and_user', (q) =>
        q.eq('semester_id', curr_sem._id).eq('user_id', user._id),
      )
      .first();
    if (!sem_user) {
      throw new ConvexError('User is not enrolled in this course');
    }

    const ta = await ctx.db
      .query('tas')
      .withIndex('by_semuser', (q) => q.eq('semester_user_id', sem_user._id))
      .first();
    if (!ta || !ta.is_admin) {
      throw new ConvexError('User is not an admin');
    }

    const allQuestions = await ctx.db
      .query('questions')
      .withIndex('by_semester_and_entry_time_ms', (q) => q.eq('semester_id', curr_sem._id))
      .collect();

    allQuestions.sort((a, b) => a.entry_time_ms - b.entry_time_ms);

    const rows = await Promise.all(
      allQuestions.map(async (q) => {
        const [student, assignment, taDoc] = await Promise.all([
          ctx.db.get(q.student_id),
          ctx.db.get(q.assignment_id),
          q.ta_id ? ctx.db.get(q.ta_id) : Promise.resolve(null),
        ]);

        let student_name = '';
        let student_email = '';
        if (student) {
          const [studentPrefs, studentUser] = await Promise.all([
            ctx.db.get(student.user_prefs_id),
            ctx.db.get(student.user_id),
          ]);
          student_name = studentPrefs?.preferred_name ?? '';
          student_email = studentUser?.email ?? '';
        }

        let ta_name = '';
        let ta_email = '';
        if (taDoc) {
          const [taPrefs, taUser] = await Promise.all([
            ctx.db.get(taDoc.user_prefs_id),
            ctx.db.get(taDoc.user_id),
          ]);
          ta_name = taPrefs?.preferred_name ?? '';
          ta_email = taUser?.email ?? '';
        }

        return {
          question_id: q._id,
          semester_id: q.semester_id,
          semester_name: curr_sem.name,
          assignment_id: q.assignment_id,
          assignment_name: assignment?.name ?? '',
          student_id: q.student_id,
          student_name,
          student_email,
          ta_id: q.ta_id ?? '',
          ta_name,
          ta_email,
          question: q.question,
          location: q.location,
          created_by: q.created_by,
          finished_by: q.finished_by,
          entry_time_ms: q.entry_time_ms,
          entry_time_iso: new Date(q.entry_time_ms).toISOString(),
          exit_time_ms: q.exit_time_ms,
          exit_time_iso: new Date(q.exit_time_ms).toISOString(),
          help_duration_ms: q.help_duration_ms,
          num_asked_to_fix: q.num_asked_to_fix,
        };
      }),
    );

    return {
      semesterName: curr_sem.name,
      rows,
    };
  },
});
