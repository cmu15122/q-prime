import React from 'react';
import {
  TextField, Grid,
} from '@mui/material';

export default function AnnouncementDialogBody(props) {
  const {content, setContent} = props;

  return (
    <Grid container spacing={3}>
      <Grid className="d-flex" item xs={12}>
        <TextField
          label="Content"
          variant="standard"
          required
          multiline
          fullWidth
          defaultValue={content}
          onChange={(event) => setContent(event.target.value)}
        />
      </Grid>
    </Grid>
  );
}
