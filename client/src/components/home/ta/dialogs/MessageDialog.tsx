import React, {useState} from 'react';
import {
  Box, Button, Dialog, DialogContent, Typography, TextField,
} from '@mui/material';

import HomeService from '../../../../services/HomeService';
import {StudentStatusValues} from '../../../../services/StudentStatus';

export default function MessageDialog(props) {
  const {isOpen, onClose, student} = props;

  const [message, setMessage] = useState('');

  const onSubmit = (event) => {
    event.preventDefault();
    HomeService.messageStudent(JSON.stringify({
      andrewID: student.andrewID,
      message: message,
    })).then(() => {
      onClose();
    });
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogContent>
        <Typography variant="h5" sx={{pb: 1, fontWeight: 'bold', textAlign: 'center'}}>
          Messaging Student &quot;{student.name}&quot;
        </Typography>
        <Typography variant="body2" sx={{pb: 1, textAlign: 'center', fontStyle: 'italic'}}>
          {
            (student.status === StudentStatusValues.RECEIVED_MESSAGE) &&
            'Note: Student has already been messaged. Sending a message here will overwrite the existing message'
          }
        </Typography>
        {
          (student.messageBuffer && student.messageBuffer.length > 0) &&
            <Box bgcolor="grey.300" sx={{mb: 2, border: 1, borderColor: 'grey.400', borderRadius: 1, display: 'flex', flexDirection: 'column', maxHeight: 80, overflow: 'hidden', overflowY: 'scroll'}}>
              <Typography variant="body2" sx={{textAlign: 'left', fontWeight: 'bold'}}>
                    Previous Messages:
              </Typography>
              {
                student.messageBuffer.map((message, index) => (
                  <Typography key={index} variant="body2" sx={{textAlign: 'left', fontStyle: 'italic'}}>
                    {message}
                  </Typography>
                ))
              }
            </Box>
        }

        <form onSubmit={onSubmit}>
          <TextField
            label="Message"
            required
            multiline
            fullWidth
            rows={4}
            onChange={(event) => setMessage(event.target.value)}
            sx={{my: 1}}
          />
          <Box textAlign="center" sx={{pt: 5}}>
            <Button type="submit" variant="contained" sx={{alignSelf: 'center'}}>Send Message</Button>
          </Box>
        </form>
      </DialogContent>
    </Dialog>
  );
}
