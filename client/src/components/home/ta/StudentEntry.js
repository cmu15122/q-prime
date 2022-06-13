import * as React from 'react';
import {
    TableRow, TableCell, IconButton, Button,
} from '@mui/material'

import {
  Help, Delete
} from '@mui/icons-material';

export default function StudentEntry(props) {

  const {theme, student, index } = props
  
  const [confirmFix, setConfirmFix] = React.useState(false);
  const [confirmRemove, setConfirmRemove] = React.useState(false);



  return (
    <TableRow
        key={student.andrewID}
        style={ index % 2 ? { background : theme.palette.background.paper }:{ background : theme.palette.background.default }}
    >
        <TableCell padding='none' component="th" scope="row" sx={{ fontSize: '16px', pl: 3.25, pr: 2, width: '15%'}}>
            {student.name} ({student.andrewID})
        </TableCell>
        <TableCell padding='none' align="left" sx={{ fontSize: '16px', width: '15%', pr: 2 }}>{student.topic}</TableCell>
        <TableCell padding='none' align="left" sx={{ fontSize: '16px', width: '35%' }}>{student.question}</TableCell>
        <TableCell padding='none' align="right" sx={{ pr: 3, width: '35%' }}>

            {confirmFix ? 
              (<Button color="error" variant="contained" sx={{m:0.5}} onClick={() => {console.log(`ask ${student.name} to fix`); setConfirmFix(false)}}>Ask to Fix</Button>)
              :
              (<IconButton color="error" onClick={() => setConfirmFix(true)}>
                  <Help />
              </IconButton>)
            }

            {confirmRemove ?
              (<Button color="error" variant="contained" sx={{m:0.5}} onClick={() => {console.log(`Removed ${student.name}`); setConfirmRemove(false)}}>Remove</Button>)
              :
              (<IconButton color="error"  onClick={() => setConfirmRemove(true)}>
                <Delete />
              </IconButton>)
            }
            

            <Button color="info" variant="contained" onClick={() => 3} sx={{m:0.5}}>Help</Button>
        </TableCell>
    </TableRow>
  )
}