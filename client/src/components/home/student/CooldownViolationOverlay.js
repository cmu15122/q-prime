import React from 'react';
import {
  Typography, Button, Dialog, DialogContent, Stack
} from '@mui/material';
import HomeService from '../../../services/HomeService';

export default function TAHelpingOverlay(props) {
  const { open, setOpen, questionValue, locationValue, topicValue, setPosition, queueData, setAskQuestionOrYourEntry } = props


  function callAddQuestionAPIOverrideCooldown() {
    HomeService.addQuestion(
      JSON.stringify({
        question: questionValue,
        location: locationValue,
        topic: topicValue,
        andrewID: queueData.andrewID,
        overrideCooldown: true
      })
    ).then(res => {
      if (res.status === 200) {
        setPosition(res.data.position)
        setAskQuestionOrYourEntry(true)
        setOpen(false)
      }
    })
  }

  return (
    <Dialog open={open} maxWidth="sm" fullWidth>
      <DialogContent sx={{ p: 5, textAlign: 'center' }} >
        <Typography variant='h6' textAlign='center'>You rejoined the queue too quickly!  Please wait for {queueData.rejoinTime} minutes after finishing your last question.</Typography>

        <Stack alignItems="baseline" justifyContent="space-around" direction="row" spacing={3}>

          <Button onClick={() => callAddQuestionAPIOverrideCooldown()} fullWidth variant="contained" sx={{ maxHeight: "50px", fontSize: "16px", mt: 3, alignContent: "center" }} type="submit">
            Override Cooldown
          </Button>
          <Button onClick={() => setOpen(false)} color='error' fullWidth variant="contained" sx={{ maxHeight: "50px", fontSize: "16px", mt: 3, alignContent: "center" }} type="submit">
            Close
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
