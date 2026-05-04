import { useState } from 'react';
import { Box, Link, TextField, Typography } from '@mui/material';

import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { useCourseId } from '../../../contexts/CourseContext';

import DialogShell from '../../common/dialogs/DialogShell';
import { t } from '../../../themes/styles';

const FORM_ID = 'ohq-update-question-form';

export default function UpdateQuestionOverlay(props) {
  const { open, handleClose } = props;
  const courseId = useCourseId();

  const queueData = useQuery(api.home.home_get.getQueueData, { courseId });
  const userData = useQuery(api.home.home_get.getUserData, { courseId });
  const studentData = userData?.student_data;

  const [tempQuestion, setTempQuestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateQuestionMutation = useMutation(api.home.home_mutate.updateQuestion);
  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    await updateQuestionMutation({
      courseId,
      question: tempQuestion,
    }).finally(() => {
      handleClose();
      setIsSubmitting(false);
    });
  };

  return (
    <DialogShell
      open={open}
      onClose={() => {}}
      title="A TA asked you to update"
      primaryAction={{
        label: 'Update Question',
        type: 'submit',
        formId: FORM_ID,
        disabled: isSubmitting,
      }}
    >
      <Typography sx={[t.bodyMuted, { mb: 2 }]}>
        A TA needs more details before they can help. Review the{' '}
        <Link target="_blank" href={queueData?.questions_policy_url || ''}>
          question guidelines
        </Link>{' '}
        and include what you&apos;ve tried so far.
      </Typography>
      <Box component="form" id={FORM_ID} onSubmit={handleSubmit}>
        <TextField
          required
          multiline
          fullWidth
          rows={4}
          variant="outlined"
          placeholder={`Previous question: ${studentData?.question || ''}`}
          value={tempQuestion}
          onChange={(event) => setTempQuestion(event.target.value)}
          inputProps={{ maxLength: 256 }}
        />
      </Box>
    </DialogShell>
  );
}
