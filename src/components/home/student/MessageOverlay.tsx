import { Box, Typography } from '@mui/material';

import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { useCourseId } from '../../../contexts/CourseContext';

import DialogShell from '../../common/dialogs/DialogShell';
import { t, s } from '../../../themes/styles';

export default function MessageOverlay(props) {
  const { open, handleClose, removeFromQueue, dismissMessage } = props;
  const leaveQueue = () => {
    removeFromQueue();
    handleClose();
  };
  const courseId = useCourseId();

  const userData = useQuery(api.home.home_get.getUserData, { courseId });
  const studentData = userData?.student_data;

  const lastMessage = studentData?.messages_from_tas[studentData.messages_from_tas.length - 1];
  const lastMessageText = lastMessage?.message || '';
  const lastMessageAuthor = lastMessage?.from_ta_name || '';

  return (
    <DialogShell
      open={open}
      onClose={dismissMessage}
      title={lastMessageAuthor ? `Note from ${lastMessageAuthor}` : 'You got a note'}
      primaryAction={{ label: 'Stay on the queue', onClick: dismissMessage }}
      secondaryAction={{ label: "I'm done", onClick: leaveQueue }}
    >
      <Box sx={[s.hairlineBox, { p: 2 }]}>
        <Typography sx={[t.body, { whiteSpace: 'pre-wrap' }]}>{lastMessageText}</Typography>
      </Box>
    </DialogShell>
  );
}
