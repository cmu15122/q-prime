import * as React from 'react';
import {
    TableRow, TableCell, IconButton, Button, Toolbar, Stack, Typography
} from '@mui/material'

import {
    Delete, StackedBarChart
} from '@mui/icons-material';

import ExtraStudentOptions from '../ta/ExtraStudentOptions'

export default function StudentEntry(props) {

  const {theme, student, index } = props
  
  const [confirmRemove, setConfirmRemove] = React.useState(false);
  const [isHelping, setIsHelping] = React.useState(false);

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

  return (
    <TableRow 
        key={student.andrewID}
        style={ index % 2 ? { background : theme.palette.background.paper }:{ background : theme.palette.background.default }}
    >
        <TableCell padding='none' component="th" scope="row" sx={{fontSize: '16px', pl: 3.25, pr: 2, width: '20%'}}>
            {student.name} ({student.andrewID})
        </TableCell>
        <TableCell padding='none' align="left" sx={{ pt: 2, pb: 2, fontSize: '16px', width: '60%', pr: 2 }}>{`[${student.topic}] ${student.question}`}</TableCell>
        <TableCell padding='none' align="center">
          {isHelping ? 
          <Stack sx={{ pt: 1, pb: 1}}>
            <Typography fontSize='14px' color={theme.palette.success.main}>You are helping</Typography>
            <Stack direction='row' justifyContent='center' spacing={2} sx={{ marginRight: '10px' }}>
              <Button variant='contained' color='cancel' sx={{ width: '40%' }}>Cancel</Button>
              <Button variant='contained' color='info' sx={{ width: '40%' }}>Done</Button>
            </Stack>
          </Stack>
          :
          (<Toolbar sx={{alignItems: 'right', justifyContent:'flex-end'}}>

            <div ref={removeRef} onClick={() => handleRemoveButton()}>
              {confirmRemove ?
                (<Button color="error" variant="contained" sx={{m:0.5}} onClick={() => console.log(`Removed ${student.name}`)}>Remove</Button>)
                :
                (<IconButton color="error">
                  <Delete />
                </IconButton>)
              }
            </div>

            <div>
              <Button color="info" variant="contained" onClick={() => setIsHelping(true)} sx={{m:0.5}}>Help</Button>
            </div>

            <div>
              <ExtraStudentOptions student={student}></ExtraStudentOptions>
            </div>

          </Toolbar>)}
        </TableCell>
    </TableRow>
  )
}