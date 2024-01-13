import React, {useContext, useState} from 'react';
import {
  Button, Dialog, DialogContent, FormControl, Input, Link, Typography,
} from '@mui/material';

import HomeService from '../../../services/HomeService';
import {StudentDataContext} from '../../../contexts/StudentDataContext';
import {QueueDataContext} from '../../../contexts/QueueDataContext';

export default function UpdateQuestionOverlay(props) {
  const {open, handleClose} = props;
  const {studentData} = useContext(StudentDataContext);
  const {queueData} = useContext(QueueDataContext);

  const [tempQuestion, setTempQuestion] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();

    HomeService.updateQuestion(
        JSON.stringify({
          id: studentData.andrewID,
          content: tempQuestion,
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
          Make sure to review <Link target="_blank" href={queueData.questionsURL}>Question Guidelines</Link> for more help!
        </Typography>

        <form onSubmit={handleSubmit}>
          <FormControl required fullWidth sx={{mt: 0.5}}>
            <Input
              placeholder={'Previous Question: ' + studentData.question}
              value={tempQuestion}
              multiline
              fullWidth
              sx={{my: 2}}
              onChange={(event) => setTempQuestion(event.target.value)}
              inputProps={{maxLength: 256}}
              type='text'
            />
          </FormControl>
          <Button fullWidth variant='contained' sx={{mt: 2, py: 1}} type='submit'>
            Update Question
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
