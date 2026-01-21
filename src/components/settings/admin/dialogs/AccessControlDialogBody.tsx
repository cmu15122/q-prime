import React from 'react';
import {
  TextField,
  Grid,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';

export default function AccessControlDialogBody(props) {
  const {
    email, setEmail, listType, setListType,
  } = props;

  return (
    <Grid container spacing={3}>
      <Grid className="d-flex" item xs={12}>
        <TextField
          label="Email Address"
          variant="standard"
          required
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="student@andrew.cmu.edu"
        />
      </Grid>
      <Grid className="d-flex" item xs={12}>
        <FormControl component="fieldset">
          <FormLabel component="legend">Access Control Type</FormLabel>
          <RadioGroup
            value={listType}
            onChange={(e) => setListType(e.target.value)}
          >
            <FormControlLabel
              value="whitelist"
              control={<Radio />}
              label="Add to Whitelist (allow access)"
            />
            <FormControlLabel
              value="blacklist"
              control={<Radio />}
              label="Add to Blacklist (deny access)"
            />
          </RadioGroup>
        </FormControl>
      </Grid>
    </Grid>
  );
}
