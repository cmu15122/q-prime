import React, { useContext } from 'react';
import {
  Typography, Button, Dialog, DialogContent, Divider,
} from '@mui/material';
import {StudentDataContext} from '../../../App';

export default function TAHelpingOverlay(props) {
  const {open, helpingTAInfo} = props;
  const {studentData} = useContext(StudentDataContext);

  function addhttp(url) {
    if (!/^(?:f|ht)tps?:\/\//.test(url)) {
      url = 'http://' + url;
    }
    return url;
  }

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
        <Typography variant="h6" textAlign="center">{studentData.question}</Typography>
      </DialogContent>
    </Dialog>
  );
}
