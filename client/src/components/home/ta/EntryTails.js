import * as React from 'react';
import {
    TableRow, TableCell, IconButton, Button, Toolbar, Stack, Typography
} from '@mui/material'

import {
    Delete, StackedBarChart
} from '@mui/icons-material';

import YouAreHelping from './TailOptions/YouAreHelping';
import ActionsHelp from './TailOptions/ActionsHelp';
import ActionsFreeze from './TailOptions/ActionsFreeze';
import StudentStatus from './TailOptions/StudentStatus';

export default function EntryTails(props) {

  const {
    theme, student, index, isHelping, helpIdx,
    removeRef, confirmRemove, handleRemoveButton, handleClickHelp, handleClickUnfreeze, handleCancel
  } = props

  const status = student.status

  const getCorrectTail = (status) => {
    switch(status) {
      case 0: {
        if (isHelping && (index == helpIdx)) {
          return (
            YouAreHelping(props)
          )
        } else {
          return (StudentStatus(props))
        }
      }
      
      case 1: {
        return (ActionsHelp(props))
      }
      
      case 2: {
        return (
          <Stack sx={{ pt: 1, pb: 1}}>
            <StudentStatus 
              student={student}
              theme={theme}
            />
            {ActionsHelp(props)}
          </Stack>
        )
      }
  
      case 3: {
        return (
          <Stack sx={{ pt: 1, pb: 1}}>
            <StudentStatus 
              student={student}
              theme={theme}
            />
            {ActionsFreeze(props)}
          </Stack>
        )
      }
      
      case 4: {
        return (
          <StudentStatus 
              student={student}
              theme={theme}
          />
        )
      }
      default:
        return
    }
  }

  return (
        <TableCell padding='none' align="center">
          {getCorrectTail(status)}
        </TableCell>
  )
}