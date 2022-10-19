import React from 'react';
import {
  Box, Button, Dialog, DialogContent, Typography,
} from '@mui/material';

export default function OpenAnnouncement(props) {
  const {isOpen, onMarkRead, onClose, announcementInfo} = props;

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogContent>
        <Typography sx={{textAlign: 'center'}}>
          {announcementInfo?.content}
        </Typography>
        <Box textAlign='center' sx={{pt: 5}}>
          <Button onClick={onMarkRead} variant="contained" sx={{alignSelf: 'center'}}>{announcementInfo?.markedRead ? 'Close' : 'Mark As Read'}</Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
