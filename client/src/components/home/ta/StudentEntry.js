import * as React from 'react';
import {
    TableRow, TableCell, IconButton, Button, Toolbar
} from '@mui/material'

import {
  Help, Delete
} from '@mui/icons-material';

export default function StudentEntry(props) {

  const {theme, student, index } = props
  
  const [confirmFix, setConfirmFix] = React.useState(false);
  const [confirmRemove, setConfirmRemove] = React.useState(false);

  const fixRef = React.useRef();
  const removeRef = React.useRef();
  
  React.useEffect(() => {
    const closeExpanded = e => {

      if(!e.path.includes(fixRef.current) && !e.path.includes(removeRef.current)) {
        setConfirmFix(false);
        setConfirmRemove(false);
      }

      //specifically if help or remove already open and the other button is pressed
      if(confirmFix && e.path.includes(removeRef.current)) {
        setConfirmFix(false);
      }
      if(confirmRemove && e.path.includes(fixRef.current)) {
        setConfirmRemove(false);
      }
    }

    document.body.addEventListener('click', closeExpanded);

    return () => {
      document.body.removeEventListener('click', closeExpanded);
    }
  })

  function handleFixButton() {
    if (confirmFix) {
      setConfirmFix(false);
      //SEND MESSAGE TO STUDENT TO FIX
    }
    else {
      setConfirmFix(true);
    }
  }

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
        <TableCell padding='none' component="th" scope="row" sx={{ fontSize: '16px', pl: 3.25, pr: 2, width: '15%'}}>
            {student.name} ({student.andrewID})
        </TableCell>
        <TableCell padding='none' align="left" sx={{ fontSize: '16px', width: '50%', pr: 2 }}>{`[${student.topic}] ${student.question}`}</TableCell>
        <TableCell padding='none' text-align="center" align="right" sx={{ pr: 3, width: '35%' }}>
          <Toolbar sx={{alignItems: 'right', justifyContent:'right'}}>

            <div ref={fixRef} onClick={() => handleFixButton()}>
              {confirmFix ? 
                (<Button color="error" variant="contained" sx={{m:0.5}} onClick={() => {console.log(`ask ${student.name} to fix`)}}>Ask to Fix</Button>)
                :
                (<IconButton color="error">
                    <Help />
                </IconButton>)
              }
            </div>
            
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
              <Button color="info" variant="contained" onClick={() => 3} sx={{m:0.5}}>Help</Button>
            </div>

          </Toolbar>
        </TableCell>
    </TableRow>
  )
}