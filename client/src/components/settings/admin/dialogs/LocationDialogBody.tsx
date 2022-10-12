import React from 'react';
import {
  TextField, Grid,
} from '@mui/material';

export default function LocationDialogBody(props) {
  const {room, setRoom} = props;

  return (
    <Grid container spacing={3}>
      <Grid className="d-flex" item xs={12}>
        <TextField
          label="Location: Building + Room Name"
          variant="standard"
          required
          fullWidth
          value={room}
          onChange={(e) => setRoom(e.target.value)}
        />
      </Grid>
    </Grid>
  );
}
