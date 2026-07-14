# Admin SQL Query Module

Read-only SQL over a snapshot of course data. Admin-only, disabled by default, fully self-contained.

## Enabling

1. Set the backend env var:

   ```bash
   npx convex env set SQL_MODULE_ENABLED true
   ```

2. As an admin, go to **Settings → Admin Settings → SQL Query Module** and flip the toggle on.

Both gates must be on. An "SQL" link then appears in the navbar at `/sql` for admins.

To disable, either flip the toggle off (runtime) or unset the env var (deploy-time).

## How it works

- Backend (`convex/sqlQuery/`) exposes an admin-gated `getViews` query that returns denormalized, read-only snapshots of `questions`, `students`, `tas`, `assignments`, `semesters`.
- Browser runs real SQL against those snapshots via [AlaSQL](https://github.com/alasql/alasql).
- Results render in a MUI DataGrid with **Download CSV** and **Copy for Spreadsheet (TSV)** buttons.

### Why client-side SQL?

The original plan ran AlaSQL server-side in a Convex Node action. AlaSQL's transitive deps (`react-native-fs` pulls in ~84 MB of React Native) blow past Convex's 42 MB module upload cap. Running AlaSQL in the browser is equivalent security-wise — the admin sees all the data regardless — and Vite bundles AlaSQL cleanly (~540 KB gzipped).

## Architecture

```
UI (src/pages/sqlQuery.tsx)
  │
  │  api.sqlQuery.sqlQuery_get.getViews()   — admin + env + setting gated
  ▼
Convex query
  │
  │  buildViews(ctx)                         — reads tables, joins, strips PII
  ▼
{ questions, students, tas, assignments, semesters }
  │
  ▼
sqlRunner.ts (client)
  │
  │  validateReadOnlySql(sql)                — SELECT/WITH only, no multi-statement
  │  alasql.Database → exec(sql)             — runs in browser
  │  slice to ROW_CAP (10k)                  — with `truncated` flag
  ▼
ResultsTable → CSV download / TSV clipboard copy
```

## Virtual tables

| Table         | Description                                             |
| ------------- | ------------------------------------------------------- |
| `questions`   | One row per completed help session; joined with student/ta/assignment/semester names |
| `students`    | One row per student per semester                        |
| `tas`         | One row per TA per semester                             |
| `assignments` | Assignments per semester                                |
| `semesters`   | All semesters                                           |

Andrew IDs are derived as the local-part of the user's email (e.g., `alice@andrew.cmu.edu` → `alice`). Real names and preferred names are exposed separately (`student_real_name` vs `student_name`). The full schema is listed in the Advanced editor's sidebar and in `VIRTUAL_TABLES_SCHEMA` in `convex/sqlQuery/sqlQuery_views.ts`.

## Safety

Three independent gates, any one of which blocks access:

1. `SQL_MODULE_ENABLED=true` env var on the Convex deployment
2. `globalSettings.sql_module_enabled === true` (runtime toggle in settings)
3. `ensureAuthAndAdmin(ctx)` on every data-returning entrypoint

Additional guards:

- **Validator** rejects anything that isn't a single `SELECT` or `WITH` statement. Multi-statement (`;` inside) is rejected.
- **No handle back to Convex** from the SQL runtime: AlaSQL operates on a detached copy. There is no way for a query to mutate course data.
- **10,000-row cap** on returned rows, with a UI warning when truncated.

## UI

Two tabs on `/sql`:

- **Simple Search** — student andrew ID, TA andrew ID, semester, date range, min/max help duration (seconds). Filters compile to a SQL string that is displayed below the form so it can be copied into the Advanced tab.
- **Advanced SQL** — monospace textarea, Run button, example query shortcuts, and a collapsible schema sidebar listing all virtual tables and their columns.

Results:

- **Download CSV** — RFC 4180-quoted CSV, saved as `qprime-query-<timestamp>.csv`.
- **Copy for Spreadsheet (TSV)** — tab-separated values copied to clipboard; pastes cleanly into Google Sheets / Excel.

## Files

### Backend

- `convex/schema.ts` — added `sql_module_enabled: v.optional(v.boolean())` to `globalSettings`
- `convex/home/home_mutate.ts` — seeds `sql_module_enabled: false` on new deployments
- `convex/common.ts` — added `internalEnsureAdmin` helper
- `convex/settings/settings_mutate.ts` — `updateSqlModuleEnabled` admin mutation
- `convex/sqlQuery/sqlQuery_views.ts` — `buildViews(ctx)` view builder, TS types, and `VIRTUAL_TABLES_SCHEMA`
- `convex/sqlQuery/sqlQuery_get.ts` — `getSqlModuleStatus` query, `getViews` query

### Frontend

- `src/App.tsx` — `/sql` route
- `src/pages/sqlQuery.tsx` — admin + env + setting gated page with clear disabled-state messaging
- `src/components/sqlQuery/sqlRunner.ts` — validator, AlaSQL execution, CSV/TSV encoders, clipboard helpers
- `src/components/sqlQuery/SqlQueryMain.tsx` — tabs, last-SQL display, error handling
- `src/components/sqlQuery/SimpleSearchForm.tsx` — filters → SQL compiler with live preview
- `src/components/sqlQuery/AdvancedSqlEditor.tsx` — textarea, example queries, schema sidebar
- `src/components/sqlQuery/ResultsTable.tsx` — MUI DataGrid with CSV download / TSV copy
- `src/components/settings/admin/SqlModuleSettings.tsx` — admin toggle (hidden unless env var is set)
- `src/components/settings/admin/AdminMain.tsx` — wires the new settings card
- `src/components/navbar/Navbar.tsx` — admin-only "SQL" nav link, gated on module status

### Tests

- `src/components/sqlQuery/sqlRunner.test.ts` — 19 Vitest tests:
  - Validator accepts `SELECT` / `WITH`, strips trailing `;`, is case-insensitive
  - Validator rejects `DROP`, `INSERT`, `UPDATE`, `DELETE`, empty, multi-statement
  - Runner handles basic SELECT, JOIN, GROUP BY / aggregates, truncation
  - CSV/TSV correctly quote commas, quotes, newlines, tabs; coerce nulls/numbers/booleans

Run tests with `npm test`.

### Docs

- `docs/LOCAL_DEV.md` — setup section for `SQL_MODULE_ENABLED`, `npm test` in scripts table
- `README.md` — feature listed as optional, links here

## Dependencies added

- `alasql` (client bundled via Vite, installed with `--omit=optional` to skip `react-native-fs`)
- `vitest` (dev)

## Out of scope

- Saved queries / query history
- Charts / visualizations in-page
- Pagination beyond the 10k cap
- Streaming export to external Postgres
- `convex-test` integration tests for the Convex queries themselves (infrastructure not yet set up in this repo)
