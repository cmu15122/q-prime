import { useState } from 'react';
import {
  Tabs,
  Tab,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Paper,
  Stack,
  Button,
} from '@mui/material';

import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';

import SimpleSearchForm from './SimpleSearchForm';
import AdvancedSqlEditor from './AdvancedSqlEditor';
import ResultsTable from './ResultsTable';
import { runSqlQuery, QueryResult } from './sqlRunner';

export default function SqlQueryMain() {
  const views = useQuery(api.sqlQuery.sqlQuery_get.getViews);
  const isLoading = views === undefined;

  const [tab, setTab] = useState(0);
  const [result, setResult] = useState<QueryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastSql, setLastSql] = useState<string | null>(null);

  const run = (sql: string) => {
    if (!views) {
      setError('Data not loaded yet');
      return;
    }
    try {
      setError(null);
      const r = runSqlQuery(sql, views);
      setResult(r);
      setLastSql(sql);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setResult(null);
      setLastSql(sql);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  const totalRows =
    views.questions.length +
    views.students.length +
    views.tas.length +
    views.assignments.length +
    views.semesters.length;

  return (
    <Box sx={{ px: 3, pb: 8 }}>
      <Typography variant="h3" textAlign="center" sx={{ mt: 4, mb: 2 }} fontWeight="bold">
        SQL Query
      </Typography>

      <Alert severity="info" sx={{ mb: 2 }}>
        Read-only SQL over a snapshot of course data. Queries run in your browser. Rows:{' '}
        {views.questions.length.toLocaleString()} questions,{' '}
        {views.students.length.toLocaleString()} students,{' '}
        {views.tas.length.toLocaleString()} TAs ({totalRows.toLocaleString()} total).
      </Alert>

      <Paper sx={{ mb: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="Simple Search" />
          <Tab label="Advanced SQL" />
        </Tabs>
        <Box sx={{ p: 2 }}>
          {tab === 0 && (
            <SimpleSearchForm views={views} onRun={run} disabled={isLoading} />
          )}
          {tab === 1 && (
            <AdvancedSqlEditor onRun={run} disabled={isLoading} initialSql={lastSql ?? undefined} />
          )}
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          <Typography variant="subtitle2">{error}</Typography>
          {lastSql && (
            <Box
              component="pre"
              sx={{ fontSize: 12, fontFamily: 'monospace', mt: 1, whiteSpace: 'pre-wrap' }}
            >
              {lastSql}
            </Box>
          )}
        </Alert>
      )}

      {result && !error && (
        <>
          {lastSql && (
            <Stack direction="row" alignItems="flex-start" spacing={1} sx={{ mb: 1 }}>
              <Paper
                variant="outlined"
                sx={{
                  flex: 1,
                  p: 1.5,
                  fontFamily: 'monospace',
                  fontSize: 12,
                  whiteSpace: 'pre-wrap',
                  bgcolor: 'background.default',
                }}
              >
                {lastSql}
              </Paper>
              <Button
                size="small"
                variant="text"
                onClick={() => {
                  navigator.clipboard?.writeText(lastSql);
                }}
              >
                Copy SQL
              </Button>
            </Stack>
          )}
          <ResultsTable result={result} />
        </>
      )}
    </Box>
  );
}
