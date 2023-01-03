import React, {useContext} from 'react';
import {
  Button, Dialog, DialogContent, Stack, TextField, Typography,
} from '@mui/material';
import {StudentDataContext} from '../../../App';

export default function MessageOverlay(props) {
  const {open, handleClose, helpingTAInfo, removeFromQueue, dismissMessage} = props;
  const {studentData} = useContext(StudentDataContext);
  const leaveQueue = () => {
    removeFromQueue();
    handleClose();
  };

  return (
    <Dialog open={open} maxWidth="sm" fullWidth>
      <DialogContent>
        <Typography variant="h5" sx={{fontWeight: 'bold'}}>
          TA {helpingTAInfo?.taName} sent you a message
        </Typography>

        <TextField
          sx={{my: 3}}
          multiline
          fullWidth
          rows={4}
          value={studentData.message}
          InputProps={{readOnly: true}}
        />

        <Stack direction="row" justifyContent="center" alignItems="center" spacing={5}>
          <Button variant="contained" color="error" onClick={leaveQueue} sx={{m: 0.5}}>
            This answered my question<br/>(leave queue)
          </Button>
          <Button variant="contained" color="info" onClick={dismissMessage} sx={{m: 0.5}}>
            This didn&apos;t answer my question<br/>(stay on the queue)
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
