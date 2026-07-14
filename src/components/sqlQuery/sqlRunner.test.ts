import { describe, it, expect } from 'vitest';

import { runSqlQuery, validateReadOnlySql, toCsv, toTsv } from './sqlRunner';
import type { Views } from '../../../convex/sqlQuery/sqlQuery_views';

function makeViews(): Views {
  return {
    questions: [
      {
        _id: 'q1',
        _creationTime: 1,
        semester_id: 's1',
        semester_name: 'F25',
        assignment_id: 'a1',
        assignment_name: 'HW1',
        assignment_type: '',
        student_id: 'st1',
        student_andrew: 'alice',
        student_name: 'Alice',
        student_real_name: 'Alice A',
        ta_id: 't1',
        ta_andrew: 'bob',
        ta_name: 'Bob',
        ta_real_name: 'Bob B',
        question: 'help',
        location: 'GHC',
        created_by: 'student',
        finished_by: 'helped',
        entry_time_ms: 1000,
        exit_time_ms: 2000,
        help_duration_ms: 1000,
        num_asked_to_fix: 0,
      },
      {
        _id: 'q2',
        _creationTime: 2,
        semester_id: 's1',
        semester_name: 'F25',
        assignment_id: 'a1',
        assignment_name: 'HW1',
        assignment_type: '',
        student_id: 'st2',
        student_andrew: 'carol',
        student_name: 'Carol',
        student_real_name: 'Carol C',
        ta_id: 't1',
        ta_andrew: 'bob',
        ta_name: 'Bob',
        ta_real_name: 'Bob B',
        question: 'help2',
        location: 'GHC',
        created_by: 'student',
        finished_by: 'helped',
        entry_time_ms: 3000,
        exit_time_ms: 4000,
        help_duration_ms: 500,
        num_asked_to_fix: 1,
      },
    ],
    students: [
      {
        _id: 'st1',
        _creationTime: 0,
        user_id: 'u1',
        semester_user_id: 'su1',
        semester_id: 's1',
        semester_name: 'F25',
        andrew: 'alice',
        name: 'Alice',
        real_name: 'Alice A',
        email: 'alice@andrew.cmu.edu',
        num_questions: 1,
        time_on_queue_ms: 1000,
        num_asked_to_fix: 0,
      },
      {
        _id: 'st2',
        _creationTime: 0,
        user_id: 'u2',
        semester_user_id: 'su2',
        semester_id: 's1',
        semester_name: 'F25',
        andrew: 'carol',
        name: 'Carol',
        real_name: 'Carol C',
        email: 'carol@andrew.cmu.edu',
        num_questions: 1,
        time_on_queue_ms: 500,
        num_asked_to_fix: 1,
      },
    ],
    tas: [
      {
        _id: 't1',
        _creationTime: 0,
        user_id: 'u3',
        semester_user_id: 'su3',
        semester_id: 's1',
        semester_name: 'F25',
        andrew: 'bob',
        name: 'Bob',
        real_name: 'Bob B',
        email: 'bob@andrew.cmu.edu',
        is_admin: true,
        num_helped: 2,
        time_helped_ms: 1500,
      },
    ],
    assignments: [
      {
        _id: 'a1',
        _creationTime: 0,
        name: 'HW1',
        semester_id: 's1',
        semester_name: 'F25',
        assignment_type: '',
        start_date_ms: 0,
        end_date_ms: 10000,
      },
    ],
    semesters: [
      {
        _id: 's1',
        _creationTime: 0,
        name: 'F25',
        owner_emails: 'owner@andrew.cmu.edu',
        enable_whitelist: false,
        enable_blacklist: false,
      },
    ],
  };
}

describe('validateReadOnlySql', () => {
  it('accepts a simple SELECT', () => {
    expect(validateReadOnlySql('SELECT 1')).toBe('SELECT 1');
  });

  it('accepts a WITH / CTE', () => {
    expect(validateReadOnlySql('WITH x AS (SELECT 1) SELECT * FROM x')).toContain('WITH');
  });

  it('strips a single trailing semicolon', () => {
    expect(validateReadOnlySql('SELECT 1;')).toBe('SELECT 1');
  });

  it('rejects DROP', () => {
    expect(() => validateReadOnlySql('DROP TABLE questions')).toThrow(/SELECT and WITH/);
  });

  it('rejects INSERT', () => {
    expect(() => validateReadOnlySql('INSERT INTO questions VALUES (1)')).toThrow(
      /SELECT and WITH/,
    );
  });

  it('rejects UPDATE', () => {
    expect(() => validateReadOnlySql('UPDATE questions SET question = ""')).toThrow(
      /SELECT and WITH/,
    );
  });

  it('rejects DELETE', () => {
    expect(() => validateReadOnlySql('DELETE FROM questions')).toThrow(/SELECT and WITH/);
  });

  it('rejects multi-statement', () => {
    expect(() => validateReadOnlySql('SELECT 1; DROP TABLE questions')).toThrow(
      /Multiple statements/,
    );
  });

  it('rejects empty', () => {
    expect(() => validateReadOnlySql('   ')).toThrow(/empty/);
  });

  it('is case-insensitive on the leading token', () => {
    expect(validateReadOnlySql('select 1')).toBe('select 1');
    expect(validateReadOnlySql('  with x AS (SELECT 1) SELECT * FROM x')).toContain('with');
  });
});

describe('runSqlQuery', () => {
  const views = makeViews();

  it('returns rows from a simple SELECT', () => {
    const r = runSqlQuery('SELECT student_andrew FROM questions ORDER BY student_andrew', views);
    expect(r.columns).toEqual(['student_andrew']);
    expect(r.rows).toEqual([['alice'], ['carol']]);
    expect(r.rowCount).toBe(2);
    expect(r.truncated).toBe(false);
  });

  it('joins questions to tas', () => {
    const r = runSqlQuery(
      `SELECT q.student_andrew, t.andrew AS ta_andrew_from_tas
       FROM questions q
       JOIN tas t ON q.ta_id = t._id
       ORDER BY q.student_andrew`,
      views,
    );
    expect(r.rows).toEqual([
      ['alice', 'bob'],
      ['carol', 'bob'],
    ]);
  });

  it('supports GROUP BY / aggregate', () => {
    const r = runSqlQuery(
      `SELECT ta_andrew, COUNT(*) AS cnt, SUM(help_duration_ms) AS total_ms
       FROM questions
       GROUP BY ta_andrew`,
      views,
    );
    expect(r.rows).toHaveLength(1);
    expect(r.rows[0][0]).toBe('bob');
    expect(r.rows[0][1]).toBe(2);
    expect(r.rows[0][2]).toBe(1500);
  });

  it('rejects non-SELECT via validator', () => {
    expect(() => runSqlQuery('DELETE FROM questions', views)).toThrow(/SELECT and WITH/);
  });

  it('reports truncation when result exceeds the row cap', () => {
    const big = makeViews();
    big.students = Array.from({ length: 10_001 }, (_, i) => ({
      _id: `st${i}`,
      _creationTime: 0,
      user_id: `u${i}`,
      semester_user_id: `su${i}`,
      semester_id: 's1',
      semester_name: 'F25',
      andrew: `u${i}`,
      name: `U${i}`,
      real_name: `U${i}`,
      email: `u${i}@x`,
      num_questions: 0,
      time_on_queue_ms: 0,
      num_asked_to_fix: 0,
    }));
    const r = runSqlQuery('SELECT andrew FROM students', big);
    expect(r.rowCount).toBe(10_001);
    expect(r.rows).toHaveLength(10_000);
    expect(r.truncated).toBe(true);
  });
});

describe('toCsv / toTsv', () => {
  it('quotes cells containing commas, quotes, and newlines in CSV', () => {
    const csv = toCsv(
      ['a', 'b', 'c'],
      [['hello, world', 'he said "hi"', 'line1\nline2']],
    );
    expect(csv).toContain('"hello, world"');
    expect(csv).toContain('"he said ""hi"""');
    expect(csv).toContain('"line1\nline2"');
  });

  it('quotes cells with tabs in TSV', () => {
    const tsv = toTsv(['a'], [['has\ttab']]);
    expect(tsv).toContain('"has\ttab"');
  });

  it('renders nulls as empty', () => {
    const csv = toCsv(['a', 'b'], [[null, 'x']]);
    const rows = csv.split('\r\n');
    expect(rows[1]).toBe(',x');
  });

  it('coerces numbers and booleans', () => {
    const csv = toCsv(['n', 'b'], [[1, true]]);
    expect(csv.split('\r\n')[1]).toBe('1,true');
  });
});
