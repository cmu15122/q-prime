import React from 'react';
import {
  Dialog, DialogContent, Stack, Typography,
} from '@mui/material';

import GoogleLogin from '../../../common/GoogleLogin';

export default function UninitializedDialog() {
  return (
    <Dialog
      open={true}
      maxWidth="sm"
      fullWidth
    >
      <DialogContent>
        <Typography sx={{pb: 3, fontWeight: 'bold', fontSize: '22px', textAlign: 'center'}}>
          Welcome to the 122 Queue!
        </Typography>
        <Typography sx={{textAlign: 'center'}}>
          Please log in with the owner email set in the environment file to proceed.
        </Typography>
        <Stack justifyContent="center" alignItems="center" sx={{pt: 5}}>
          <GoogleLogin/>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
