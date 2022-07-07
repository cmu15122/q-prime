import * as React from 'react';
import {
    TableRow, TableCell, IconButton, Button, Toolbar, Stack, Typography
} from '@mui/material'

import {
    Delete
} from '@mui/icons-material';

import ExtraStudentOptions from './ExtraStudentOptions';

export default function PersistentOptions(props) {

  const {
    theme, student, index, isHelping, setIsHelping, helpIdx,
    removeRef, confirmRemove, handleRemoveButton, handleClickHelp
  } = props

  return (
    <Toolbar sx={{alignItems: 'right', justifyContent:'flex-end'}}>

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
          <ExtraStudentOptions student={student}></ExtraStudentOptions>
        </div>

    </Toolbar>
  )
}