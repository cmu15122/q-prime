import React from 'react';
import {
  Button, Stack, useTheme,
} from '@mui/material';

export default function YouAreHelping(props) {
  const {
    removeRef, removeStudent, index, handleCancel,
  } = props;
  const theme = useTheme();

  return (
    <Stack
      direction={{xs: 'column', sm: 'row'}}
      sx={{alignItems: 'center', justifyContent: 'flex-end'}}
    >
      <Button variant='contained' style={{background: theme.alternateColors.cancel}} sx={{m: 0.5}} onClick={() => handleCancel(index)}>
        Cancel
      </Button>
      <Button variant='contained' color='info' sx={{m: 0.5}} ref={removeRef} onClick={() => removeStudent(index)}>
        Done
      </Button>
    </Stack>
  );
}
