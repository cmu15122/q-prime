import React from 'react';
import {
  Button, Dialog, DialogContent, Input, Stack, Typography,
} from '@mui/material';

import HomeService from '../../../services/HomeService';
import {useStudentDataContext} from '../../../App';

export default function UpdateQuestionOverlay(props) {
  const {open, handleClose} = props;
  const {studentData, setStudentData} = useStudentDataContext();

  const printAndClose = (event) => {
    event.preventDefault();

    HomeService.updateQuestion(
        JSON.stringify({
          id: studentData.andrewID,
          content: studentData.question,
        }),
    ).then(() => {
      handleClose();
    });
  };

  return (
    <Dialog open={open} maxWidth="sm" fullWidth>
      <DialogContent>
        <Typography variant="h5" sx={{fontWeight: 'bold'}}>
          Please update your question!
        </Typography>
        <Typography variant="body1" sx={{fontStyle: 'italic'}}>
          Your entry has been frozen on the queue.
        </Typography>

        <Typography variant="body1" sx={{pt: 2}}>
          A TA has requested that you update your question. Before we can help you, we need more details from you.
          More specifically, we need to know what you&apos;ve tried and already understand in addition to your question.
          Make sure to review *Insert Diderot link* for more help!
        </Typography>

        <Input
          placeholder="Question (max 256 characters)"
          multiline
          fullWidth
          sx={{my: 2}}
          onChange={(event) => setStudentData({...studentData, question: event.target.value})}
          inputProps={{maxLength: 256}}
        />

        <Stack alignItems="center" sx={{pt: 2}}>
          <Button variant="contained" onClick={printAndClose}>Update Question</Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
