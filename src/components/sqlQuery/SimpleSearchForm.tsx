import { useMemo, useState } from 'react';
import {
  Button,
  Stack,
  Typography,
  TextField,
  MenuItem,
  Alert,
  Box,
  Paper,
} from '@mui/material';

import type { Views } from '../../../convex/sqlQuery/sqlQuery_views';

export type SimpleFilters = {
  studentAndrew: string;
  taAndrew: string;
  semesterId: string;
  startDate: string;
  endDate: string;
  minDurationSec: string;
  maxDurationSec: string;
};

const EMPTY: SimpleFilters = {
  studentAndrew: '',
  taAndrew: '',
  semesterId: '',
  startDate: '',
  endDate: '',
  minDurationSec: '',
  maxDurationSec: '',
};

function sqlStringEscape(s: string): string {
  return "'" + s.replace(/'/g, "''") + "'";
}

function dateToMs(localDate: string, endOfDay: boolean): number | null {
  if (!localDate) return null;
  // localDate is yyyy-mm-dd from <input type="date">; interpret as local midnight
  const d = new Date(localDate + (endOfDay ? 'T23:59:59.999' : 'T00:00:00'));
  const t = d.getTime();
  return Number.isFinite(t) ? t : null;
}

/**
 * Compile a small set of filters into a SQL query over the `questions` view.
 */
export function compileSimpleFiltersToSql(f: SimpleFilters): string {
  const where: string[] = [];

  if (f.studentAndrew.trim()) {
    where.push(`student_andrew = ${sqlStringEscape(f.studentAndrew.trim())}`);
  }
  if (f.taAndrew.trim()) {
    where.push(`ta_andrew = ${sqlStringEscape(f.taAndrew.trim())}`);
  }
  if (f.semesterId.trim()) {
    where.push(`semester_id = ${sqlStringEscape(f.semesterId.trim())}`);
  }

  const startMs = dateToMs(f.startDate, false);
  const endMs = dateToMs(f.endDate, true);
  if (startMs !== null) where.push(`entry_time_ms >= ${startMs}`);
  if (endMs !== null) where.push(`entry_time_ms <= ${endMs}`);

  const minDur = f.minDurationSec.trim();
  const maxDur = f.maxDurationSec.trim();
  if (minDur && !Number.isNaN(Number(minDur))) {
    where.push(`help_duration_ms >= ${Number(minDur) * 1000}`);
  }
  if (maxDur && !Number.isNaN(Number(maxDur))) {
    where.push(`help_duration_ms <= ${Number(maxDur) * 1000}`);
  }

  const whereClause = where.length > 0 ? `\nWHERE ${where.join('\n  AND ')}` : '';

  return `SELECT
  semester_name,
  assignment_name,
  student_andrew,
  student_name,
  ta_andrew,
  ta_name,
  question,
  location,
  finished_by,
  entry_time_ms,
  exit_time_ms,
  help_duration_ms
FROM questions${whereClause}
ORDER BY entry_time_ms DESC
LIMIT 10000`;
}

export default function SimpleSearchForm(props: {
  views: Views | undefined;
  onRun: (sql: string) => void;
  disabled: boolean;
}) {
  const { views, onRun, disabled } = props;
  const [filters, setFilters] = useState<SimpleFilters>(EMPTY);

  const semesterOptions = useMemo(() => {
    if (!views) return [];
    return [...views.semesters].sort((a, b) => a.name.localeCompare(b.name));
  }, [views]);

  const compiledSql = useMemo(() => compileSimpleFiltersToSql(filters), [filters]);

  const update = <K extends keyof SimpleFilters>(key: K, value: SimpleFilters[K]) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const handleRun = () => onRun(compiledSql);
  const handleReset = () => setFilters(EMPTY);

  return (
    <Stack spacing={2}>
      <Alert severity="info">
        Enter any combination of filters. All filters are ANDed together. Leave a field blank
        to match anything.
      </Alert>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} flexWrap="wrap">
        <TextField
          label="Student Andrew ID"
          size="small"
          value={filters.studentAndrew}
          onChange={(e) => update('studentAndrew', e.target.value)}
          sx={{ minWidth: 200 }}
        />
        <TextField
          label="TA Andrew ID"
          size="small"
          value={filters.taAndrew}
          onChange={(e) => update('taAndrew', e.target.value)}
          sx={{ minWidth: 200 }}
        />
        <TextField
          select
          label="Semester"
          size="small"
          value={filters.semesterId}
          onChange={(e) => update('semesterId', e.target.value)}
          sx={{ minWidth: 220 }}
        >
          <MenuItem value="">All semesters</MenuItem>
          {semesterOptions.map((s) => (
            <MenuItem key={s._id} value={s._id}>
              {s.name}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} flexWrap="wrap">
        <TextField
          label="Start date"
          size="small"
          type="date"
          value={filters.startDate}
          onChange={(e) => update('startDate', e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="End date"
          size="small"
          type="date"
          value={filters.endDate}
          onChange={(e) => update('endDate', e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Min help duration (sec)"
          size="small"
          type="number"
          value={filters.minDurationSec}
          onChange={(e) => update('minDurationSec', e.target.value)}
          sx={{ minWidth: 180 }}
        />
        <TextField
          label="Max help duration (sec)"
          size="small"
          type="number"
          value={filters.maxDurationSec}
          onChange={(e) => update('maxDurationSec', e.target.value)}
          sx={{ minWidth: 180 }}
        />
      </Stack>

      <Stack direction="row" spacing={2}>
        <Button variant="contained" onClick={handleRun} disabled={disabled}>
          Run search
        </Button>
        <Button variant="outlined" onClick={handleReset}>
          Reset
        </Button>
      </Stack>

      <Box>
        <Typography variant="caption" color="text.secondary">
          Compiled SQL (copy into Advanced tab to tweak):
        </Typography>
        <Paper
          variant="outlined"
          sx={{
            p: 1.5,
            mt: 0.5,
            fontFamily: 'monospace',
            fontSize: 13,
            whiteSpace: 'pre-wrap',
            bgcolor: 'background.default',
          }}
        >
          {compiledSql}
        </Paper>
      </Box>
    </Stack>
  );
}
