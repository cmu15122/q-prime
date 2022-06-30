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

export default function EntryTails(props) {

  const {
    theme, student, index, isHelping, setIsHelping, helpIdx,
    removeRef, confirmRemove, handleRemoveButton, handleClickHelp
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
          return (ActionsHelp(props))
        }
      }
      
      case 1: {
        return (ActionsHelp(props))
      }
      
      case 2: {
        return (ActionsFreeze(props))
      }
  
      case 3: {
        return (ActionsHelp(props))
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