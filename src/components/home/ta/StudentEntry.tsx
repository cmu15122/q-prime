import { Box, Stack, Typography } from '@mui/material';
import PauseIcon from '@mui/icons-material/Pause';

import EntryTails from './EntryTails';
import StudentStatus from './TailOptions/StudentStatus';

import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { Doc } from '../../../../convex/_generated/dataModel';
import { useCourseId } from '../../../contexts/CourseContext';
import { t } from '../../../themes/styles';

// Statuses that show the paused badge (pause icon + label) in the status column.
export const PAUSED_STATUSES: Doc<'ohq'>['status'][] = [
  'cooldown_violation',
  'fixing_question',
  'frozen',
];

export default function StudentEntry(props) {
  const courseId = useCourseId();
  const student: Doc<'ohq'> = props['student'];
  const { index } = props;

  const showCooldownApproval = student.status === 'cooldown_violation';
  const isPaused = PAUSED_STATUSES.includes(student.status);

  const userData = useQuery(api.home.home_get.getUserData, { courseId });
  const isOwnHelp =
    student.status === 'being_helped' && student.helping_ta?.ta_id === userData?.ta_data?.ta_id;

  const approveCooldownOverrideMutation = useMutation(api.home.home_mutate.approveCooldownOverride);
  const approveCooldownOverride = async () => {
    await approveCooldownOverrideMutation({
      courseId,
      student_id: student.student_id,
    });
  };

  // Each row owns its layout — no dependency on any other row. The question
  // (1fr) is the greedy field; this row's own status column (only present when
  // this student is paused) eats into it from the left and the actions (content
  // width) eat into it from the right.
  const gridTemplateColumns = isPaused
    ? '22% 64px minmax(0, 1fr) auto'
    : '22% minmax(0, 1fr) auto';

  return (
    <Box
      role="listitem"
      sx={(theme) => ({
        display: 'grid',
        gridTemplateColumns,
        alignItems: 'start',
        columnGap: 1,
        px: 2,
        py: 1.25,
        bgcolor: index % 2 ? theme.palette.background.paper : theme.palette.paper[3],
      })}
    >
      {/* Identity */}
      <Box sx={{ minWidth: 0, wordBreak: 'break-word' }}>
        <Typography sx={t.studentName}>{student.student_name}</Typography>
        <Typography sx={t.studentEmail}>{student.student_email}</Typography>
        <Typography sx={[t.monoLabel, { mt: '2px' }]}>[{student.location}]</Typography>
      </Box>

      {/* Status — present only when this student is paused; no column otherwise. */}
      {isPaused && (
        <Stack
          alignItems="center"
          justifyContent="center"
          spacing={0.5}
          sx={{ alignSelf: 'center', minWidth: 0 }}
        >
          <PauseIcon fontSize="small" />
          <StudentStatus student={student} isOwnHelp={isOwnHelp} />
        </Stack>
      )}

      {/* Question — fills the remaining space */}
      <Box sx={{ minWidth: 0, wordBreak: 'break-word' }}>
        <Typography sx={t.monoTag}>[{student.assignment_name}]</Typography>
        <Typography sx={[t.bodySmall, { mt: 0.5, color: 'ink.primary' }]}>
          {student.question}
        </Typography>
      </Box>

      {/* Actions — content width, hugging the right edge */}
      <Box sx={{ justifySelf: 'end', alignSelf: 'center', minWidth: 0 }}>
        <EntryTails
          {...props}
          showCooldownApproval={showCooldownApproval}
          approveCooldownOverride={approveCooldownOverride}
        />
      </Box>
    </Box>
  );
}
