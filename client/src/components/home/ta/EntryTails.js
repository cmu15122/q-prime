import * as React from 'react';
import {
  TableCell, Stack
} from '@mui/material'

import YouAreHelping from './TailOptions/YouAreHelping';
import ActionsHelp from './TailOptions/ActionsHelp';
import ActionsFreeze from './TailOptions/ActionsFreeze';
import StudentStatus from './TailOptions/StudentStatus';
import LeapStudentActions from './TailOptions/LeapStudentActions';

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
          return (
            <Stack direction='row' sx={{ pt: 1, pb: 1}} justifyContent='space-between'>
              <StudentStatus 
                student={student}
                theme={theme}
                justifySelf='flex-start'
              />
              {ActionsHelp(props)}
          </Stack>
          )
        }
      }
      
      case 1: {
        return (ActionsHelp(props))
      }
      
      case 2: {
        return (
          <Stack direction='row' sx={{ pt: 1, pb: 1}} justifyContent='space-between'>
            <StudentStatus 
              student={student}
              theme={theme}
              justifySelf='flex-start'
            />
            {ActionsHelp(props)}
          </Stack>
        )
      }
  
      case 3: {
        return (
          <Stack direction='row' sx={{ pt: 1, pb: 1}} justifyContent='space-between'>
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
          <Stack direction='row' sx={{ pt: 1, pb: 1}} justifyContent='space-between'>
            <StudentStatus 
                student={student}
                theme={theme}
            />
            {LeapStudentActions(props)}
          </Stack>
        )
      }
      default:
        return
    }
  }

  return (
    <TableCell align="justify" sx={{mr: 1}} alignSelf='flex-end'>
      {getCorrectTail(status)}
    </TableCell>
  )
}