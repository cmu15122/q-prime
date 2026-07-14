import { v } from 'convex/values';
import { internalMutation } from '../_generated/server';
import { Id } from '../_generated/dataModel';
import { getCurrentSemester } from '../common';

/**
 * Seed the database with fake questions/students/tas/assignments for
 * testing the SQL query module.
 *
 * Usage:
 *   npx convex run sqlQuery/sqlQuery_seed:seedTestData
 *
 * To wipe what this created:
 *   npx convex run sqlQuery/sqlQuery_seed:wipeTestData
 *
 * Everything it creates is tagged with emails ending in @test.sql so it's easy
 * to identify and remove. Safe to run multiple times - it only appends.
 */

const TEST_EMAIL_DOMAIN = 'test.sql';

const FAKE_STUDENTS = [
  'alice',
  'bob',
  'carol',
  'dave',
  'eve',
  'frank',
  'grace',
  'heidi',
  'ivan',
  'judy',
  'kevin',
  'lisa',
  'mallory',
  'niaj',
  'olivia',
  'peggy',
  'quinn',
  'ruth',
  'sybil',
  'trent',
  'uma',
  'victor',
  'wendy',
  'xavier',
  'yvonne',
];

const FAKE_TAS = [
  { andrew: 'tabitha', name: 'Tabitha Taylor' },
  { andrew: 'tomas', name: 'Tomas Torres' },
  { andrew: 'tina', name: 'Tina Thompson' },
  { andrew: 'terry', name: 'Terry Turner' },
  { andrew: 'trevor', name: 'Trevor Tyler' },
];

const FAKE_ASSIGNMENTS = [
  { name: 'HW1 - C0 Basics', type: 'Homework' },
  { name: 'HW2 - Arrays and Loops', type: 'Homework' },
  { name: 'HW3 - Contracts', type: 'Homework' },
  { name: 'Lab 1', type: 'Lab' },
  { name: 'Lab 2', type: 'Lab' },
  { name: 'Exam 1 Review', type: 'Exam' },
];

const LOCATIONS = ['GHC 5207', 'GHC 4301', 'WEH 4623', 'Zoom'];
const SAMPLE_QUESTIONS = [
  'Help with array indexing',
  'Segfault in my code',
  'Getting wrong answer on tests',
  "My code doesn't compile",
  'Question about contracts',
  'Help understanding loop invariants',
  'Pointer confusion',
  'String manipulation question',
  'Recursion help',
  'Debugging memory issues',
];

function pick<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)];
}

// deterministic PRNG so results are reproducible
function mulberry32(seed: number): () => number {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const seedTestData = internalMutation({
  args: {
    numQuestions: v.optional(v.number()),
    seed: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const rng = mulberry32(args.seed ?? 1234);
    const numQuestions = args.numQuestions ?? 250;

    const curr_sem = await getCurrentSemester(ctx);
    const now = Date.now();
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

    // --- Assignments ---
    const assignmentIds: Id<'assignments'>[] = [];
    for (const a of FAKE_ASSIGNMENTS) {
      const existing = await ctx.db
        .query('assignments')
        .withIndex('by_sem_name', (q) =>
          q.eq('semester_id', curr_sem._id).eq('name', a.name),
        )
        .first();
      if (existing) {
        assignmentIds.push(existing._id);
      } else {
        const id = await ctx.db.insert('assignments', {
          name: a.name,
          semester_id: curr_sem._id,
          assignment_type: a.type,
          start_date_ms: now - thirtyDaysMs,
          end_date_ms: now + thirtyDaysMs,
        });
        assignmentIds.push(id);
      }
    }

    // --- Students (user + prefs + semesterUser + student) ---
    const studentIds: Id<'students'>[] = [];
    for (const andrew of FAKE_STUDENTS) {
      const email = `${andrew}@${TEST_EMAIL_DOMAIN}`;
      const name = andrew[0].toUpperCase() + andrew.slice(1) + ' Student';

      let user = await ctx.db
        .query('users')
        .withIndex('email', (q) => q.eq('email', email))
        .first();
      if (!user) {
        const userId = await ctx.db.insert('users', { email, name });
        user = (await ctx.db.get(userId))!;
      }

      let prefs = await ctx.db
        .query('userPreferences')
        .withIndex('by_user_id', (q) => q.eq('user_id', user._id))
        .first();
      if (!prefs) {
        const prefsId = await ctx.db.insert('userPreferences', {
          user_id: user._id,
          preferred_name: name,
        });
        prefs = (await ctx.db.get(prefsId))!;
      }

      let semUser = await ctx.db
        .query('semesterUsers')
        .withIndex('by_sem_and_user', (q) =>
          q.eq('semester_id', curr_sem._id).eq('user_id', user._id),
        )
        .first();
      if (!semUser) {
        const semUserId = await ctx.db.insert('semesterUsers', {
          user_id: user._id,
          user_prefs_id: prefs._id,
          semester_id: curr_sem._id,
          kind: 'student',
          notification: { title: '', body: '', timestamp: 0 },
        });
        semUser = (await ctx.db.get(semUserId))!;
      }

      let student = await ctx.db
        .query('students')
        .withIndex('by_semuser', (q) => q.eq('semester_user_id', semUser!._id))
        .first();
      if (!student) {
        const studentId = await ctx.db.insert('students', {
          user_id: user._id,
          user_prefs_id: prefs._id,
          semester_user_id: semUser._id,
          num_questions: 0,
          time_on_queue_ms: 0,
          num_asked_to_fix: 0,
        });
        student = (await ctx.db.get(studentId))!;
      }
      studentIds.push(student._id);
    }

    // --- TAs ---
    const taIds: Id<'tas'>[] = [];
    for (const t of FAKE_TAS) {
      const email = `${t.andrew}@${TEST_EMAIL_DOMAIN}`;

      let user = await ctx.db
        .query('users')
        .withIndex('email', (q) => q.eq('email', email))
        .first();
      if (!user) {
        const userId = await ctx.db.insert('users', { email, name: t.name });
        user = (await ctx.db.get(userId))!;
      }

      let prefs = await ctx.db
        .query('userPreferences')
        .withIndex('by_user_id', (q) => q.eq('user_id', user._id))
        .first();
      if (!prefs) {
        const prefsId = await ctx.db.insert('userPreferences', {
          user_id: user._id,
          preferred_name: t.name,
        });
        prefs = (await ctx.db.get(prefsId))!;
      }

      let semUser = await ctx.db
        .query('semesterUsers')
        .withIndex('by_sem_and_user', (q) =>
          q.eq('semester_id', curr_sem._id).eq('user_id', user._id),
        )
        .first();
      if (!semUser) {
        const semUserId = await ctx.db.insert('semesterUsers', {
          user_id: user._id,
          user_prefs_id: prefs._id,
          semester_id: curr_sem._id,
          kind: 'TA',
          notification: { title: '', body: '', timestamp: 0 },
        });
        semUser = (await ctx.db.get(semUserId))!;
      }

      let ta = await ctx.db
        .query('tas')
        .withIndex('by_semuser', (q) => q.eq('semester_user_id', semUser!._id))
        .first();
      if (!ta) {
        const taId = await ctx.db.insert('tas', {
          user_id: user._id,
          user_prefs_id: prefs._id,
          semester_user_id: semUser._id,
          is_admin: false,
          zoom_enabled: false,
          zoom_url: '',
          join_notifs_enabled: false,
          remind_notifs_enabled: false,
          remind_time_mins: 10,
          show_self_timer: false,
          show_others_timer: false,
          num_helped: 0,
          time_helped_ms: 0,
        });
        ta = (await ctx.db.get(taId))!;
      }
      taIds.push(ta._id);
    }

    // --- Questions ---
    let inserted = 0;
    for (let i = 0; i < numQuestions; i++) {
      const studentId = pick(studentIds, rng);
      const taId = pick(taIds, rng);
      const assignmentId = pick(assignmentIds, rng);

      // entry time somewhere in the last 30 days
      const entry = now - Math.floor(rng() * thirtyDaysMs);
      // wait 1-15 min then helped for 1-25 min (~10% are removed)
      const waitMs = (1 + Math.floor(rng() * 15)) * 60_000;
      const isRemoved = rng() < 0.1;
      const helpMs = isRemoved ? -1 : (1 + Math.floor(rng() * 25)) * 60_000;
      const exit = entry + waitMs + (helpMs > 0 ? helpMs : 0);

      await ctx.db.insert('questions', {
        semester_id: curr_sem._id,
        assignment_id: assignmentId,
        student_id: studentId,
        ta_id: isRemoved ? undefined : taId,
        question: pick(SAMPLE_QUESTIONS, rng),
        location: pick(LOCATIONS, rng),
        created_by: 'student',
        finished_by: isRemoved ? 'removed' : 'helped',
        entry_time_ms: entry,
        exit_time_ms: exit,
        help_duration_ms: helpMs,
        num_asked_to_fix: rng() < 0.1 ? 1 : 0,
      });
      inserted++;
    }

    return {
      students: studentIds.length,
      tas: taIds.length,
      assignments: assignmentIds.length,
      questions: inserted,
    };
  },
});

/**
 * Delete everything created by seedTestData (identified by @test.sql emails).
 */
export const wipeTestData = internalMutation({
  args: {},
  handler: async (ctx) => {
    const testUsers = (await ctx.db.query('users').collect()).filter((u) =>
      u.email?.endsWith('@' + TEST_EMAIL_DOMAIN),
    );
    const testUserIds = new Set(testUsers.map((u) => u._id));

    // find students & tas for those users
    const allStudents = await ctx.db.query('students').collect();
    const testStudentIds = new Set<Id<'students'>>(
      allStudents.filter((s) => testUserIds.has(s.user_id)).map((s) => s._id),
    );
    const allTas = await ctx.db.query('tas').collect();
    const testTaIds = new Set<Id<'tas'>>(
      allTas.filter((t) => testUserIds.has(t.user_id)).map((t) => t._id),
    );

    // delete questions involving test students or test tas
    let qDeleted = 0;
    for (const q of await ctx.db.query('questions').collect()) {
      if (
        testStudentIds.has(q.student_id) ||
        (q.ta_id !== undefined && testTaIds.has(q.ta_id))
      ) {
        await ctx.db.delete(q._id);
        qDeleted++;
      }
    }

    // delete students / tas / semesterUsers / userPreferences / users
    let sDeleted = 0;
    for (const id of testStudentIds) {
      await ctx.db.delete(id);
      sDeleted++;
    }
    let tDeleted = 0;
    for (const id of testTaIds) {
      await ctx.db.delete(id);
      tDeleted++;
    }

    let suDeleted = 0;
    const allSemUsers = await ctx.db.query('semesterUsers').collect();
    for (const su of allSemUsers) {
      if (testUserIds.has(su.user_id)) {
        await ctx.db.delete(su._id);
        suDeleted++;
      }
    }

    let prefsDeleted = 0;
    const allPrefs = await ctx.db.query('userPreferences').collect();
    for (const p of allPrefs) {
      if (testUserIds.has(p.user_id)) {
        await ctx.db.delete(p._id);
        prefsDeleted++;
      }
    }

    let uDeleted = 0;
    for (const u of testUsers) {
      await ctx.db.delete(u._id);
      uDeleted++;
    }

    return {
      users: uDeleted,
      userPreferences: prefsDeleted,
      semesterUsers: suDeleted,
      students: sDeleted,
      tas: tDeleted,
      questions: qDeleted,
    };
  },
});
