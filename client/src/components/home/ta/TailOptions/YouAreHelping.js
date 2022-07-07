import * as React from 'react';
import {
   Button, Stack, Typography
} from '@mui/material'


export default function YouAreHelping(props) {

  const {
    theme, setIsHelping, removeRef, removeStudent, index, handleCancel,
  } = props

  return (
    <Stack sx={{ pt: 1, pb: 1}}>
        <Typography fontSize='14px' color={theme.palette.success.main}>You are helping</Typography>
        <Stack direction='row' justifyContent='center' spacing={2} sx={{ marginRight: '10px' }}>
          <Button variant='contained' color='cancel' sx={{ width: '40%' }} onClick={() => handleCancel(index)}>Cancel</Button>
          <Button variant='contained' color='info' sx={{ width: '40%' }} 
                  ref={removeRef} onClick={() => removeStudent()}
          >
            Done
          </Button>
        </Stack>
      </Stack>
  )
}