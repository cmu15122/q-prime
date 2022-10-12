import React, {useState} from 'react';
import {
  Grid, TextField, Typography,
} from '@mui/material';
import {DesktopDatePicker, TimePicker} from '@mui/x-date-pickers';
import {SxProps} from '@mui/system';

export default function DateTimeSelector(props) {
  const popperSx: SxProps = {
    '& .MuiPaper-root': {
      padding: 2,
      marginTop: 1,
    },
  };

  const [value, setValue] = useState(new Date());

  const handleChange = (newValue) => {
    setValue(newValue);
  };

  return (
    <div>
      <Typography variant="h5" sx={{mt: 4, ml: 10}} fontWeight='bold'>
        OH Session Statistics
      </Typography>
      <Grid container spacing={3} sx={{mt: 2, ml: 10, maxWidth: '90%'}} >
        <Grid className="d-flex" item xs={2}>
          <DesktopDatePicker
            label="Date"
            inputFormat="MM/dd/yyyy"
            value={value}
            onChange={handleChange}
            renderInput={(params) => <TextField {...params} />}
            PopperProps={{
              sx: popperSx,
            }}
          />
        </Grid>
        <Grid className="d-flex" item xs={2}>
          <TimePicker
            label="OH Slot Start Time"
            value={value}
            onChange={handleChange}
            renderInput={(params) => <TextField {...params} />}
          />
        </Grid>
        <Grid className="d-flex" item xs={2}>
          <TimePicker
            label="OH Slot End Time"
            value={value}
            onChange={handleChange}
            renderInput={(params) => <TextField {...params} />}
          />
        </Grid>
      </Grid>
    </div>
  );
}
