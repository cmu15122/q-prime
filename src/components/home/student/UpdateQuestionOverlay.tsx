import { useState } from 'react';
import { Button, Dialog, DialogContent, FormControl, Input, Link, Typography } from '@mui/material';

import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';

export default function UpdateQuestionOverlay(props) {
  const { open, handleClose } = props;

  const queueData = useQuery(api.home.home_get.getQueueData);
  const userData = useQuery(api.home.home_get.getUserData);
  const studentData = userData?.student_data;

  const [tempQuestion, setTempQuestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateQuestionMutation = useMutation(api.home.home_mutate.updateQuestion);
  const handleSubmit = async (event) => {
    event.preventDefault();

    setIsSubmitting(true);

    await updateQuestionMutation({
      question: tempQuestion,
    }).finally(() => {
      handleClose();
      setIsSubmitting(false);
    });
  };

  return (
    <Dialog open={open} maxWidth="sm" fullWidth>
      <DialogContent>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          Please update your question!
        </Typography>
        <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
          Your entry has been frozen on the queue.
        </Typography>

        <Typography variant="body1" sx={{ pt: 2 }}>
          A TA has requested that you update your question. Before we can help you, we need more
          details from you. More specifically, we need to know what you&apos;ve tried and already
          understand in addition to your question. Make sure to review{' '}
          <Link target="_blank" href={queueData?.questions_policy_url || ''}>
            Question Guidelines
          </Link>{' '}
          for more help!
        </Typography>

        <form onSubmit={handleSubmit}>
          <FormControl required fullWidth sx={{ mt: 0.5 }}>
            <Input
              placeholder={'Previous Question: ' + studentData?.question || ''}
              value={tempQuestion}
              multiline
              fullWidth
              sx={{ my: 2 }}
              onChange={(event) => setTempQuestion(event.target.value)}
              inputProps={{ maxLength: 256 }}
              type="text"
            />
          </FormControl>
          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 2, py: 1 }}
            type="submit"
            disabled={isSubmitting}
          >
            Update Question
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
