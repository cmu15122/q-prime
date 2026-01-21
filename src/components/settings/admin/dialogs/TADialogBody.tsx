import React from 'react';
import {
  Checkbox, FormControlLabel, TextField, Grid,
} from '@mui/material';

export default function TADialogBody(props) {
  const {
    name, setName, isAdmin, setIsAdmin, email, setEmail,
  } = props;

  return (
    <Grid container spacing={3}>
      <Grid className="d-flex" item xs={8}>
        <TextField
          label="TA Name"
          variant="standard"
          required
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </Grid>
      <Grid className="d-flex" item xs={4}>
        <FormControlLabel
          label="Is Admin?"
          labelPlacement="start"
          sx={{pt: 1}}
          control={
            <Checkbox
              checked={isAdmin}
              onChange={(e) => setIsAdmin(e.target.checked)}
            />
          }
        />
      </Grid>
      <Grid className="d-flex" item xs={12}>
        <TextField
          label="TA Email"
          variant="standard"
          required
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </Grid>
    </Grid>
  );
}
