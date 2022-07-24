import * as React from 'react';
import {
  Button, Stack, Typography
} from '@mui/material'


export default function YouAreHelping(props) {

  const {
    theme, setIsHelping, removeRef, removeStudent, handleClickHelp, index, handleCancel,
  } = props

  return (
    <Stack direction='row' sx={{ pt: 1, pb: 1, pr: 1 }} justifyContents='flex-end'>
      <Typography fontSize='14px' color={theme.palette.success.main} alignSelf='center'>You are helping</Typography>
      <Stack direction='row' justifyContent='flex-end' spacing={2} sx={{ mr: 1 }}>
        <Button variant='contained' color='cancel' sx={{ width: '40%' }} onClick={() => handleCancel(index)}>Cancel</Button>
        <Button variant='contained' color='info' sx={{ width: '40%' }}
          ref={removeRef} onClick={() => removeStudent(index)}
        >
          Done
        </Button>
      </Stack>
    </Stack>
  )
}
