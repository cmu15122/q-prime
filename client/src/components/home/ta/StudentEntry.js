import * as React from 'react';
import {
    TableRow, TableCell, IconButton, Button, Toolbar, Stack, Typography
} from '@mui/material'

import {
    Delete, StackedBarChart
} from '@mui/icons-material';

import ExtraStudentOptions from './ExtraStudentOptions'
import EntryTails from './EntryTails';

export default function StudentEntry(props) {

  const {theme, student, index, isHelping, setIsHelping, helpIdx, setHelpIdx } = props
  
  const [confirmRemove, setConfirmRemove] = React.useState(false);
  

  const removeRef = React.useRef();
  
  React.useEffect(() => {
    const closeExpanded = e => {

    if(!e.path.includes(removeRef.current)) {
        setConfirmRemove(false);
      }
    }

    document.body.addEventListener('click', closeExpanded);

    return () => {
      document.body.removeEventListener('click', closeExpanded);
    }
  })

  function handleRemoveButton() {
    if (confirmRemove) {
      setConfirmRemove(false);
      //REMOVE STUDENT FROM QUEUE
    }
    else {
      setConfirmRemove(true);
    }
  }

  const handleClickHelp = (index) => {
    setHelpIdx(index);
    setIsHelping(true);
  }

  return (
    <TableRow 
        key={student.andrewID}
        style={ index % 2 ? { background : theme.palette.background.paper }:{ background : theme.palette.background.default }}
    >
        <TableCell padding='none' component="th" scope="row" sx={{fontSize: '16px', pl: 3.25, pr: 2, width: '20%'}}>
            {student.name} ({student.andrewID})
        </TableCell>
        <TableCell padding='none' align="left" sx={{ pt: 2, pb: 2, fontSize: '16px', width: '60%', pr: 2 }}>{`[${student.topic}] ${student.question}`}</TableCell>
        {EntryTails(
          {
            ... props,
            removeRef:removeRef, 
            confirmRemove: confirmRemove, 
            handleRemoveButton: handleRemoveButton, 
            handleClickHelp: handleClickHelp,
          }
        )}
    </TableRow>
  )
}