import {
    Typography
} from '@mui/material'

import * as React from 'react';

export default function StudentStatus(props) {

  const {
    student
  } = props

  const status = student.status

  const chooseText = (status) => {
      switch (status) {
          case 0: return 'TA is Helping'
          case 2: return 'Frozen'
          case 3: return 'Updating Question'
          default: return 'Not valid position'
      }
  }

  return (
    <Typography>
        {chooseText(status)}
    </Typography>
  )
}