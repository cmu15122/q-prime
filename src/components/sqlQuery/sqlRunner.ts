import alasql from 'alasql';
import type { Views } from '../../../convex/sqlQuery/sqlQuery_views';

const ROW_CAP = 10_000;

export type QueryResult = {
  columns: string[];
  rows: unknown[][];
  rowCount: number;
  truncated: boolean;
  elapsedMs: number;
};

/**
 * Reject any SQL that is not a single SELECT / WITH statement.
 * Not a security boundary (SQL runs client-side against data the admin already sees),
 * but guards against accidental misuse.
 */
export function validateReadOnlySql(raw: string): string {
  const trimmed = raw.trim().replace(/;\s*$/, '');
  if (trimmed.length === 0) {
    throw new Error('SQL query is empty');
  }

  if (trimmed.includes(';')) {
    throw new Error('Multiple statements are not allowed');
  }

  const firstTokenMatch = trimmed.match(/^\s*([A-Za-z]+)/);
  const firstToken = firstTokenMatch ? firstTokenMatch[1].toUpperCase() : '';
  if (firstToken !== 'SELECT' && firstToken !== 'WITH') {
    throw new Error(`Only SELECT and WITH queries are allowed (got: ${firstToken || '???'})`);
  }

  return trimmed;
}

/**
 * Run a read-only SQL query against the denormalized views.
 * Pure client-side. The views are snapshots loaded from an admin-gated Convex query.
 */
export function runSqlQuery(sql: string, views: Views): QueryResult {
  const sanitized = validateReadOnlySql(sql);

  const db = new alasql.Database();
  db.exec('CREATE TABLE questions');
  db.exec('CREATE TABLE students');
  db.exec('CREATE TABLE tas');
  db.exec('CREATE TABLE assignments');
  db.exec('CREATE TABLE semesters');
  const tables = db.tables as Record<string, { data: unknown[] }>;
  tables.questions.data = views.questions;
  tables.students.data = views.students;
  tables.tas.data = views.tas;
  tables.assignments.data = views.assignments;
  tables.semesters.data = views.semesters;

  const start = Date.now();
  let result: unknown;
  try {
    result = db.exec(sanitized);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`SQL error: ${msg}`);
  }
  const elapsedMs = Date.now() - start;

  if (!Array.isArray(result)) {
    throw new Error(
      'Query did not produce a rowset. Only SELECT/WITH queries returning rows are supported.',
    );
  }

  const totalRows = result.length;
  const truncated = totalRows > ROW_CAP;
  const slice = truncated ? (result as unknown[]).slice(0, ROW_CAP) : (result as unknown[]);

  const columns: string[] = [];
  const seen = new Set<string>();
  const sampleLimit = Math.min(slice.length, 100);
  for (let i = 0; i < sampleLimit; i++) {
    const row = slice[i];
    if (row && typeof row === 'object') {
      for (const k of Object.keys(row as Record<string, unknown>)) {
        if (!seen.has(k)) {
          seen.add(k);
          columns.push(k);
        }
      }
    }
  }

  const rows: unknown[][] = slice.map((row) => {
    if (row && typeof row === 'object') {
      const r = row as Record<string, unknown>;
      return columns.map((c) => r[c] ?? null);
    }
    return columns.map(() => null);
  });

  return { columns, rows, rowCount: totalRows, truncated, elapsedMs };
}

/** RFC 4180 CSV quoting */
function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return '';
  const s = typeof value === 'string' ? value : String(value);
  if (/[",\r\n]/.test(s)) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

export function toCsv(columns: string[], rows: unknown[][]): string {
  const lines: string[] = [];
  lines.push(columns.map(csvEscape).join(','));
  for (const row of rows) {
    lines.push(row.map(csvEscape).join(','));
  }
  return lines.join('\r\n');
}

/**
 * TSV with tab/newline escaping. Pastes cleanly into Google Sheets / Excel.
 * Cells containing tabs, newlines, or quotes are quoted and internal quotes doubled.
 */
function tsvEscape(value: unknown): string {
  if (value === null || value === undefined) return '';
  const s = typeof value === 'string' ? value : String(value);
  if (/[\t\r\n"]/.test(s)) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

export function toTsv(columns: string[], rows: unknown[][]): string {
  const lines: string[] = [];
  lines.push(columns.map(tsvEscape).join('\t'));
  for (const row of rows) {
    lines.push(row.map(tsvEscape).join('\t'));
  }
  return lines.join('\n');
}

export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  // fallback
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.top = '-1000px';
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
  } finally {
    document.body.removeChild(ta);
  }
}
