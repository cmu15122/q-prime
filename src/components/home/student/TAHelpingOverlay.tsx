import { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';

import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { useCourseId } from '../../../contexts/CourseContext';

import DialogShell from '../../common/dialogs/DialogShell';
import HelpTimer from '../../common/timer/HelpTimer';

export default function TAHelpingOverlay(props: { open: boolean }) {
  const { open } = props;
  const courseId = useCourseId();

  const userData = useQuery(api.home.home_get.getUserData, { courseId });
  const studentData = userData?.student_data;

  const [dismissed, setDismissed] = useState(false);
  useEffect(() => {
    if (!open) setDismissed(false);
  }, [open]);

  const taName = studentData?.helping_ta?.preferred_name || '';
  const zoomUrl = studentData?.helping_ta?.zoom_enabled ? studentData?.helping_ta?.zoom_url : null;

  return (
    <DialogShell
      open={open && !dismissed}
      onClose={() => setDismissed(true)}
      title={`${taName} is helping you`}
      primaryAction={
        zoomUrl
          ? {
              label: 'Open Zoom',
              onClick: () => window.open(zoomUrl, '_blank', 'noopener'),
            }
          : undefined
      }
      secondaryAction={{ label: 'Got it', onClick: () => setDismissed(true) }}
    >
      <Box>
        <Typography sx={{ fontSize: 14, color: 'ink.primary', mb: 2 }}>
          {studentData?.question || ''}
        </Typography>
        {studentData?.help_start_time_ms && (
          <HelpTimer startTime={studentData.help_start_time_ms} />
        )}
      </Box>
    </DialogShell>
  );
}
