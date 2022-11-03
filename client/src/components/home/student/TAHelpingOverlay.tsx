import React from 'react';
import {
  Typography, Button, Dialog, DialogContent, Divider,
} from '@mui/material';

export default function TAHelpingOverlay(props) {
  const {open, helpingTAInfo, question} = props;

  function addhttp(url) {
    if (!/^(?:f|ht)tps?:\/\//.test(url)) {
      url = 'http://' + url;
    }
    return url;
  }
  console.log(helpingTAInfo);
  return (
    <Dialog open={open} maxWidth="sm" fullWidth>
      <DialogContent sx={{p: 5, textAlign: 'center'}} >
        <Typography variant="h6" textAlign="center">You are being helped by {helpingTAInfo?.taName} (TA)!</Typography>
        {
          helpingTAInfo?.taZoomUrl &&
            <Button sx={{mt: 3}} variant="contained" target="_blank" href={addhttp(helpingTAInfo?.taZoomUrl)}>Join Zoom</Button>
        }
        <Divider sx={{mt: '.5em', mb: '.5em'}}/>
        <Typography variant="h6" textAlign="center">As a reminder, you asked:</Typography>
        <Typography variant="h6" textAlign="center">{question}</Typography>
      </DialogContent>
    </Dialog>
  );
}
