import { QueryCtx } from '../_generated/server';
import { Doc, Id } from '../_generated/dataModel';

/**
 * TS types for the virtual tables exposed to SQL queries.
 * Kept in this module so both the server (view builder) and client (SQL runner)
 * can use the same shape.
 */
export type QuestionsRow = {
  _id: string;
  _creationTime: number;
  semester_id: string;
  semester_name: string;
  assignment_id: string;
  assignment_name: string;
  assignment_type: string;
  student_id: string;
  student_andrew: string;
  student_name: string;
  student_real_name: string;
  ta_id: string | null;
  ta_andrew: string;
  ta_name: string;
  ta_real_name: string;
  question: string;
  location: string;
  created_by: 'student' | 'TA';
  finished_by: 'helped' | 'removed';
  entry_time_ms: number;
  exit_time_ms: number;
  help_duration_ms: number;
  num_asked_to_fix: number;
};

export type StudentsRow = {
  _id: string;
  _creationTime: number;
  user_id: string;
  semester_user_id: string;
  semester_id: string;
  semester_name: string;
  andrew: string;
  name: string;
  real_name: string;
  email: string;
  num_questions: number;
  time_on_queue_ms: number;
  num_asked_to_fix: number;
};

export type TasRow = {
  _id: string;
  _creationTime: number;
  user_id: string;
  semester_user_id: string;
  semester_id: string;
  semester_name: string;
  andrew: string;
  name: string;
  real_name: string;
  email: string;
  is_admin: boolean;
  num_helped: number;
  time_helped_ms: number;
};

export type AssignmentsRow = {
  _id: string;
  _creationTime: number;
  name: string;
  semester_id: string;
  semester_name: string;
  assignment_type: string;
  start_date_ms: number;
  end_date_ms: number;
};

export type SemestersRow = {
  _id: string;
  _creationTime: number;
  name: string;
  owner_emails: string;
  enable_whitelist: boolean;
  enable_blacklist: boolean;
};

export type Views = {
  questions: QuestionsRow[];
  students: StudentsRow[];
  tas: TasRow[];
  assignments: AssignmentsRow[];
  semesters: SemestersRow[];
};

// Andrew ID = local-part of email (before @). For @andrew.cmu.edu this is the CMU andrew ID.
function andrewId(email: string | undefined | null): string {
  if (!email) return '';
  const at = email.indexOf('@');
  return at === -1 ? email : email.slice(0, at);
}

/**
 * Build denormalized, read-only views of the course data for SQL querying.
 * Called from the admin-gated getViews query.
 */
export async function buildViews(ctx: QueryCtx): Promise<Views> {
  const [
    users,
    userPreferences,
    semesterUsers,
    students,
    tas,
    questions,
    assignments,
    semesters,
  ] = await Promise.all([
    ctx.db.query('users').collect(),
    ctx.db.query('userPreferences').collect(),
    ctx.db.query('semesterUsers').collect(),
    ctx.db.query('students').collect(),
    ctx.db.query('tas').collect(),
    ctx.db.query('questions').collect(),
    ctx.db.query('assignments').collect(),
    ctx.db.query('semesters').collect(),
  ]);

  const userById = new Map<Id<'users'>, Doc<'users'>>();
  for (const u of users) userById.set(u._id, u);

  const prefsById = new Map<Id<'userPreferences'>, Doc<'userPreferences'>>();
  for (const p of userPreferences) prefsById.set(p._id, p);

  const semUserById = new Map<Id<'semesterUsers'>, Doc<'semesterUsers'>>();
  for (const su of semesterUsers) semUserById.set(su._id, su);

  const studentById = new Map<Id<'students'>, Doc<'students'>>();
  for (const s of students) studentById.set(s._id, s);

  const taById = new Map<Id<'tas'>, Doc<'tas'>>();
  for (const t of tas) taById.set(t._id, t);

  const assignmentById = new Map<Id<'assignments'>, Doc<'assignments'>>();
  for (const a of assignments) assignmentById.set(a._id, a);

  const semesterById = new Map<Id<'semesters'>, Doc<'semesters'>>();
  for (const s of semesters) semesterById.set(s._id, s);

  function userAndrewFromId(user_id: Id<'users'>): string {
    const u = userById.get(user_id);
    return andrewId(u?.email);
  }

  function preferredNameFromPrefsId(prefs_id: Id<'userPreferences'>): string {
    const p = prefsById.get(prefs_id);
    return p?.preferred_name ?? '';
  }

  function realNameFromUserId(user_id: Id<'users'>): string {
    const u = userById.get(user_id);
    return u?.name ?? '';
  }

  const questionsView: QuestionsRow[] = questions.map((q) => {
    const student = studentById.get(q.student_id);
    const studentUserId = student?.user_id;
    const ta = q.ta_id ? taById.get(q.ta_id) : undefined;
    const taUserId = ta?.user_id;
    const assignment = assignmentById.get(q.assignment_id);
    const semester = semesterById.get(q.semester_id);

    return {
      _id: q._id as string,
      _creationTime: q._creationTime,
      semester_id: q.semester_id as string,
      semester_name: semester?.name ?? '',
      assignment_id: q.assignment_id as string,
      assignment_name: assignment?.name ?? '',
      assignment_type: assignment?.assignment_type ?? '',
      student_id: q.student_id as string,
      student_andrew: studentUserId ? userAndrewFromId(studentUserId) : '',
      student_name: student ? preferredNameFromPrefsId(student.user_prefs_id) : '',
      student_real_name: studentUserId ? realNameFromUserId(studentUserId) : '',
      ta_id: (q.ta_id as string | undefined) ?? null,
      ta_andrew: taUserId ? userAndrewFromId(taUserId) : '',
      ta_name: ta ? preferredNameFromPrefsId(ta.user_prefs_id) : '',
      ta_real_name: taUserId ? realNameFromUserId(taUserId) : '',
      question: q.question,
      location: q.location,
      created_by: q.created_by,
      finished_by: q.finished_by,
      entry_time_ms: q.entry_time_ms,
      exit_time_ms: q.exit_time_ms,
      help_duration_ms: q.help_duration_ms,
      num_asked_to_fix: q.num_asked_to_fix,
    };
  });

  const studentsView: StudentsRow[] = students.map((s) => {
    const semUser = semUserById.get(s.semester_user_id);
    const semester = semUser ? semesterById.get(semUser.semester_id) : undefined;

    return {
      _id: s._id as string,
      _creationTime: s._creationTime,
      user_id: s.user_id as string,
      semester_user_id: s.semester_user_id as string,
      semester_id: (semUser?.semester_id as string | undefined) ?? '',
      semester_name: semester?.name ?? '',
      andrew: userAndrewFromId(s.user_id),
      name: preferredNameFromPrefsId(s.user_prefs_id),
      real_name: realNameFromUserId(s.user_id),
      email: userById.get(s.user_id)?.email ?? '',
      num_questions: s.num_questions,
      time_on_queue_ms: s.time_on_queue_ms,
      num_asked_to_fix: s.num_asked_to_fix,
    };
  });

  const tasView: TasRow[] = tas.map((t) => {
    const semUser = semUserById.get(t.semester_user_id);
    const semester = semUser ? semesterById.get(semUser.semester_id) : undefined;

    return {
      _id: t._id as string,
      _creationTime: t._creationTime,
      user_id: t.user_id as string,
      semester_user_id: t.semester_user_id as string,
      semester_id: (semUser?.semester_id as string | undefined) ?? '',
      semester_name: semester?.name ?? '',
      andrew: userAndrewFromId(t.user_id),
      name: preferredNameFromPrefsId(t.user_prefs_id),
      real_name: realNameFromUserId(t.user_id),
      email: userById.get(t.user_id)?.email ?? '',
      is_admin: t.is_admin,
      num_helped: t.num_helped,
      time_helped_ms: t.time_helped_ms,
    };
  });

  const assignmentsView: AssignmentsRow[] = assignments.map((a) => {
    const semester = semesterById.get(a.semester_id);
    return {
      _id: a._id as string,
      _creationTime: a._creationTime,
      name: a.name,
      semester_id: a.semester_id as string,
      semester_name: semester?.name ?? '',
      assignment_type: a.assignment_type ?? '',
      start_date_ms: a.start_date_ms,
      end_date_ms: a.end_date_ms,
    };
  });

  const semestersView: SemestersRow[] = semesters.map((s) => ({
    _id: s._id as string,
    _creationTime: s._creationTime,
    name: s.name,
    owner_emails: s.owner_emails.join(','),
    enable_whitelist: s.enable_whitelist,
    enable_blacklist: s.enable_blacklist,
  }));

  return {
    questions: questionsView,
    students: studentsView,
    tas: tasView,
    assignments: assignmentsView,
    semesters: semestersView,
  };
}

/**
 * Static schema description of the virtual tables, consumed by the UI schema sidebar.
 * Keep in sync with buildViews above.
 */
export const VIRTUAL_TABLES_SCHEMA: {
  name: string;
  description: string;
  columns: { name: string; type: string }[];
}[] = [
  {
    name: 'questions',
    description: 'One row per completed help session (helped or removed)',
    columns: [
      { name: '_id', type: 'string' },
      { name: '_creationTime', type: 'number' },
      { name: 'semester_id', type: 'string' },
      { name: 'semester_name', type: 'string' },
      { name: 'assignment_id', type: 'string' },
      { name: 'assignment_name', type: 'string' },
      { name: 'assignment_type', type: 'string' },
      { name: 'student_id', type: 'string' },
      { name: 'student_andrew', type: 'string' },
      { name: 'student_name', type: 'string (preferred)' },
      { name: 'student_real_name', type: 'string' },
      { name: 'ta_id', type: 'string | null' },
      { name: 'ta_andrew', type: 'string' },
      { name: 'ta_name', type: 'string (preferred)' },
      { name: 'ta_real_name', type: 'string' },
      { name: 'question', type: 'string' },
      { name: 'location', type: 'string' },
      { name: 'created_by', type: "'student' | 'TA'" },
      { name: 'finished_by', type: "'helped' | 'removed'" },
      { name: 'entry_time_ms', type: 'number (unix ms)' },
      { name: 'exit_time_ms', type: 'number (unix ms)' },
      { name: 'help_duration_ms', type: 'number (-1 if removed)' },
      { name: 'num_asked_to_fix', type: 'number' },
    ],
  },
  {
    name: 'students',
    description: 'One row per student per semester',
    columns: [
      { name: '_id', type: 'string' },
      { name: 'semester_id', type: 'string' },
      { name: 'semester_name', type: 'string' },
      { name: 'andrew', type: 'string' },
      { name: 'name', type: 'string (preferred)' },
      { name: 'real_name', type: 'string' },
      { name: 'email', type: 'string' },
      { name: 'num_questions', type: 'number' },
      { name: 'time_on_queue_ms', type: 'number' },
      { name: 'num_asked_to_fix', type: 'number' },
    ],
  },
  {
    name: 'tas',
    description: 'One row per TA per semester',
    columns: [
      { name: '_id', type: 'string' },
      { name: 'semester_id', type: 'string' },
      { name: 'semester_name', type: 'string' },
      { name: 'andrew', type: 'string' },
      { name: 'name', type: 'string (preferred)' },
      { name: 'real_name', type: 'string' },
      { name: 'email', type: 'string' },
      { name: 'is_admin', type: 'boolean' },
      { name: 'num_helped', type: 'number' },
      { name: 'time_helped_ms', type: 'number' },
    ],
  },
  {
    name: 'assignments',
    description: 'Assignments per semester',
    columns: [
      { name: '_id', type: 'string' },
      { name: 'name', type: 'string' },
      { name: 'semester_id', type: 'string' },
      { name: 'semester_name', type: 'string' },
      { name: 'assignment_type', type: 'string' },
      { name: 'start_date_ms', type: 'number (unix ms)' },
      { name: 'end_date_ms', type: 'number (unix ms)' },
    ],
  },
  {
    name: 'semesters',
    description: 'All semesters',
    columns: [
      { name: '_id', type: 'string' },
      { name: 'name', type: 'string' },
      { name: 'owner_emails', type: 'string (comma-separated)' },
      { name: 'enable_whitelist', type: 'boolean' },
      { name: 'enable_blacklist', type: 'boolean' },
    ],
  },
];
