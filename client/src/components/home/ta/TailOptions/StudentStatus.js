import {
    Typography
} from '@mui/material'

import * as React from 'react';

export default function StudentStatus(props) {

  const {
    student, theme
  } = props

  const status = student.status

  const chooseText = (status) => {
      switch (status) {
          case 0: return 'TA is Helping'
          case 2: return 'Updating Question'
          case 3: return 'Frozen'
          case 4: return 'Joined Before Cooldown'
          default: return 'Not valid position'
      }
  }

  return (
    <Typography fontSize='14px' color={theme.palette.success.main} alignSelf='center'>
        {chooseText(status)}
    </Typography>
  )
}