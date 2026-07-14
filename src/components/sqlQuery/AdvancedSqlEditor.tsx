import { useState } from 'react';
import {
  Button,
  Stack,
  Typography,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { VIRTUAL_TABLES_SCHEMA } from '../../../convex/sqlQuery/sqlQuery_views';

const EXAMPLES: { label: string; sql: string }[] = [
  {
    label: 'All questions in current semester, most recent first',
    sql: `SELECT entry_time_ms, student_andrew, ta_andrew, assignment_name, help_duration_ms
FROM questions
ORDER BY entry_time_ms DESC
LIMIT 500`,
  },
  {
    label: 'Top 20 most-helped students by total time on queue',
    sql: `SELECT student_andrew, student_name,
       COUNT(*) AS num_questions,
       SUM(help_duration_ms) / 60000.0 AS total_helped_mins
FROM questions
WHERE finished_by = 'helped'
GROUP BY student_andrew, student_name
ORDER BY total_helped_mins DESC
LIMIT 20`,
  },
  {
    label: 'TA leaderboard for a date range',
    sql: `SELECT ta_andrew, ta_name,
       COUNT(*) AS num_helped,
       SUM(help_duration_ms) / 60000.0 AS total_helped_mins
FROM questions
WHERE finished_by = 'helped'
  AND entry_time_ms >= 0
GROUP BY ta_andrew, ta_name
ORDER BY num_helped DESC`,
  },
];

export default function AdvancedSqlEditor(props: {
  onRun: (sql: string) => void;
  disabled: boolean;
  initialSql?: string;
}) {
  const { onRun, disabled, initialSql } = props;
  const [sql, setSql] = useState(initialSql ?? EXAMPLES[0].sql);

  const handleRun = () => onRun(sql);

  return (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ width: '100%' }}>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <textarea
          value={sql}
          onChange={(e) => setSql(e.target.value)}
          spellCheck={false}
          style={{
            width: '100%',
            minHeight: 260,
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            fontSize: 14,
            padding: 10,
            boxSizing: 'border-box',
            border: '1px solid rgba(0,0,0,0.23)',
            borderRadius: 4,
            resize: 'vertical',
          }}
          placeholder="SELECT ..."
        />
        <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap">
          <Button variant="contained" onClick={handleRun} disabled={disabled}>
            Run query
          </Button>
          {EXAMPLES.map((ex) => (
            <Button
              key={ex.label}
              size="small"
              variant="text"
              onClick={() => setSql(ex.sql)}
            >
              {ex.label}
            </Button>
          ))}
        </Stack>
      </Box>

      <Box sx={{ flexBasis: { md: 320 }, flexShrink: 0 }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Virtual tables
        </Typography>
        {VIRTUAL_TABLES_SCHEMA.map((table) => (
          <Accordion key={table.name} disableGutters defaultExpanded={table.name === 'questions'}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography sx={{ fontFamily: 'monospace' }}>{table.name}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                {table.description}
              </Typography>
              <Paper variant="outlined" sx={{ p: 1, bgcolor: 'background.default' }}>
                <Box component="table" sx={{ fontSize: 12, fontFamily: 'monospace' }}>
                  <tbody>
                    {table.columns.map((c) => (
                      <tr key={c.name}>
                        <Box
                          component="td"
                          sx={{ pr: 1.5, verticalAlign: 'top', color: 'text.primary' }}
                        >
                          {c.name}
                        </Box>
                        <Box component="td" sx={{ color: 'text.secondary' }}>
                          {c.type}
                        </Box>
                      </tr>
                    ))}
                  </tbody>
                </Box>
              </Paper>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </Stack>
  );
}
