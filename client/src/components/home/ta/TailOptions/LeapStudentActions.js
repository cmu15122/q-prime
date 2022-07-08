import * as React from 'react';
import {
   Button, Stack, Typography, IconButton, Toolbar
} from '@mui/material'

import {
    Delete
} from '@mui/icons-material'
import PersistentOptions from './PersistentOptions';


export default function LeapStudentActions(props) {

  const {
    theme, student, confirmRemove, setIsHelping, removeRef, removeStudent, index, handleCancel, handleRemoveButton, addStudent
  } = props

  return (
    <Toolbar sx={{alignItems: 'right', justifyContent:'flex-end'}}>
        <div>
          <Button color="success" variant="contained" onClick={() => addStudent(index)} sx={{m:0.5}}>Approve</Button>
        </div>

        {PersistentOptions(props)}

    </Toolbar>
  )
}