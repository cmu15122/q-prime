import { Box, CardContent, Divider, Stack, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import PauseIcon from '@mui/icons-material/Pause';

import BaseCard from '../../common/cards/BaseCard';
import OhqButton from '../../common/buttons/OhqButton';

import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { useCourseId } from '../../../contexts/CourseContext';
import { t, s } from '../../../themes/styles';

export default function YourEntry(props) {
  const { openRemoveOverlay } = props;
  const courseId = useCourseId();

  const queueData = useQuery(api.home.home_get.getQueueData, { courseId });
  const userData = useQuery(api.home.home_get.getUserData, { courseId });
  const studentData = userData?.student_data;

  const cooldownMsg = queueData?.allow_cooldown_override
    ? 'Frozen in line — you will not advance until a TA approves your entry.'
    : 'Frozen in line — wait for your cooldown to end before joining the queue again.';

  const position =
    studentData && queueData
      ? Math.max(studentData.position + 1 - (queueData.num_students - queueData.num_unhelped), 1)
      : 0;

  const estimatedMins =
    !queueData || !studentData || queueData.num_tas * studentData.position === 0
      ? 0
      : Math.floor((queueData.mins_per_student / queueData.num_tas) * studentData.position);

  const isPaused =
    studentData &&
    (studentData.status === 'fixing_question' ||
      studentData.status === 'frozen' ||
      studentData.status === 'cooldown_violation');

  return (
    <BaseCard>
      <CardContent sx={{ p: '20px 24px' }}>
        <Stack direction="row" alignItems="flex-start" spacing={2.5}>
          <Box className="ohq-position-num" sx={t.positionNum}>
            #{position}
          </Box>
          <Box sx={{ flex: 1, minWidth: 0, alignSelf: 'center' }}>
            <Typography
              sx={(theme) => ({
                fontFamily: theme.fonts.ui,
                fontWeight: 600,
                fontSize: 20,
                color: theme.palette.ink.primary,
                lineHeight: 1.3,
              })}
            >
              ~{estimatedMins} minute{estimatedMins === 1 ? '' : 's'} wait
            </Typography>
          </Box>
          <OhqButton variant="icon" tone="danger" aria-label="remove" onClick={openRemoveOverlay}>
            <DeleteIcon fontSize="small" />
          </OhqButton>
        </Stack>

        {isPaused && (
          <Box sx={[s.amberWarning, { mt: 2 }]}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <PauseIcon sx={{ color: 'amber.main', fontSize: 20 }} />
              <Typography sx={{ fontSize: 13.5, color: 'ink.primary' }}>{cooldownMsg}</Typography>
            </Stack>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        <Stack direction="row" spacing={4} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
          <Box>
            <Box sx={t.monoLabel}>[location]</Box>
            <Typography sx={{ fontSize: 14, color: 'ink.primary' }}>
              {studentData?.location || ''}
            </Typography>
          </Box>
          <Box>
            <Box sx={t.monoLabel}>[topic]</Box>
            <Typography sx={{ fontSize: 14, color: 'ink.primary' }}>
              {studentData?.assignment_name || ''}
            </Typography>
          </Box>
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Box sx={t.monoLabel}>QUESTION</Box>
        <Typography sx={[t.body, { mt: 0.5, whiteSpace: 'pre-line' }]}>
          {studentData?.question || ''}
        </Typography>
      </CardContent>
    </BaseCard>
  );
}
