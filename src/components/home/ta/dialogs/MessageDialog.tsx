import { useState } from 'react';
import { Box, TextField, Typography } from '@mui/material';

import { Doc } from '../../../../../convex/_generated/dataModel';
import { useMutation } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import { useCourseId } from '../../../../contexts/CourseContext';

import DialogShell from '../../../common/dialogs/DialogShell';
import { t, s } from '../../../../themes/styles';

const FORM_ID = 'ohq-ta-message-form';

export default function MessageDialog(props) {
  const { isOpen, onClose } = props;
  const student: Doc<'ohq'> = props['student'];
  const courseId = useCourseId();

  const [message, setMessage] = useState('');

  const messageStudentMutation = useMutation(api.home.home_mutate.messageStudent);
  const onSubmit = async (event) => {
    event.preventDefault();
    await messageStudentMutation({
      courseId,
      message,
      student_id: student.student_id,
    }).then(() => {
      onClose();
    });
  };

  return (
    <DialogShell
      open={isOpen}
      onClose={onClose}
      title={`Send a note to ${student.student_name}`}
      primaryAction={{ label: 'Send', type: 'submit', formId: FORM_ID }}
      secondaryAction={{ label: 'Cancel', onClick: onClose }}
    >
      {student.messages_from_tas.length > 0 && (
        <Box sx={[s.hairlineBox, { mb: 2, maxHeight: 120, overflowY: 'auto' }]}>
          {student.messages_from_tas.map((m, index) => (
            <Typography key={index} sx={[t.body, { mt: index === 0 ? 0 : 0.5 }]}>
              <strong>{m.from_ta_name}:</strong> {m.message}
            </Typography>
          ))}
        </Box>
      )}

      <Box component="form" id={FORM_ID} onSubmit={onSubmit}>
        <TextField
          label="Message"
          required
          multiline
          fullWidth
          rows={4}
          variant="outlined"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
        />
      </Box>
    </DialogShell>
  );
}
