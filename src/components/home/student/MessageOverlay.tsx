import { Button, Dialog, DialogContent, Stack, TextField, Typography } from '@mui/material';

import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { useCourseId } from '../../../contexts/CourseContext';

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
    <Dialog open={open} maxWidth="sm" fullWidth>
      <DialogContent>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          TA {lastMessageAuthor} sent you a message
        </Typography>

        <TextField
          sx={{ my: 3 }}
          multiline
          fullWidth
          rows={4}
          value={lastMessageText}
          InputProps={{ readOnly: true }}
        />

        <Stack direction="row" justifyContent="center" alignItems="center" spacing={5}>
          <Button variant="contained" color="error" onClick={leaveQueue} sx={{ m: 0.5 }}>
            This answered my question
            <br />
            (leave queue)
          </Button>
          <Button variant="contained" color="info" onClick={dismissMessage} sx={{ m: 0.5 }}>
            This didn&apos;t answer my question
            <br />
            (stay on the queue)
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
