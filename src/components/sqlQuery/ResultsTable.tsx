import { useMemo, useState } from 'react';
import { Button, Stack, Typography, Alert, Box } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

import { QueryResult, toCsv, toTsv, downloadCsv, copyToClipboard } from './sqlRunner';

function formatCell(v: unknown): string {
  if (v === null || v === undefined) return '';
  if (typeof v === 'object') return JSON.stringify(v);
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  return String(v);
}

export default function ResultsTable(props: { result: QueryResult }) {
  const { result } = props;
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  const gridColumns: GridColDef[] = useMemo(
    () =>
      result.columns.map((c) => ({
        field: c,
        headerName: c,
        flex: 1,
        minWidth: 140,
        sortable: true,
        valueFormatter: ({ value }) => formatCell(value),
      })),
    [result.columns],
  );

  const gridRows = useMemo(
    () =>
      result.rows.map((row, i) => {
        const obj: Record<string, unknown> = { id: i };
        result.columns.forEach((c, j) => {
          obj[c] = row[j];
        });
        return obj;
      }),
    [result.rows, result.columns],
  );

  const handleDownloadCsv = () => {
    const csv = toCsv(result.columns, result.rows);
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    downloadCsv(`qprime-query-${ts}.csv`, csv);
  };

  const handleCopyTsv = async () => {
    try {
      const tsv = toTsv(result.columns, result.rows);
      await copyToClipboard(tsv);
      setCopyStatus('Copied! Paste into a spreadsheet.');
      setTimeout(() => setCopyStatus(null), 2500);
    } catch (err) {
      setCopyStatus(`Copy failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Stack direction="row" spacing={2} sx={{ mb: 1 }} alignItems="center" flexWrap="wrap">
        <Typography variant="body2" color="text.secondary">
          {result.rowCount.toLocaleString()} row{result.rowCount === 1 ? '' : 's'} in{' '}
          {result.elapsedMs} ms
          {result.truncated && ` (showing first ${result.rows.length.toLocaleString()})`}
        </Typography>
        <Button size="small" variant="outlined" onClick={handleDownloadCsv} disabled={result.rows.length === 0}>
          Download CSV
        </Button>
        <Button size="small" variant="outlined" onClick={handleCopyTsv} disabled={result.rows.length === 0}>
          Copy for Spreadsheet (TSV)
        </Button>
        {copyStatus && (
          <Typography variant="caption" color="text.secondary">
            {copyStatus}
          </Typography>
        )}
      </Stack>

      {result.truncated && (
        <Alert severity="warning" sx={{ mb: 1 }}>
          Result truncated to 10,000 rows. Add <code>LIMIT</code> / filters to your query for a
          complete result, or download what is shown.
        </Alert>
      )}

      <Box sx={{ height: 560, width: '100%' }}>
        <DataGrid
          rows={gridRows}
          columns={gridColumns}
          density="compact"
          disableSelectionOnClick
          pageSize={100}
          rowsPerPageOptions={[25, 50, 100, 500]}
        />
      </Box>
    </Box>
  );
}
