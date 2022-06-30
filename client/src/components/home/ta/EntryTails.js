import * as React from 'react';
import {
    TableRow, TableCell, IconButton, Button, Toolbar, Stack, Typography
} from '@mui/material'

import {
    Delete, StackedBarChart
} from '@mui/icons-material';

import YouAreHelping from './TailOptions/YouAreHelping';
import StudentIsHelped from './TailOptions/StudentIsHelped';
import ExtraStudentOptions from './TailOptions/ExtraStudentOptions'

export default function EntryTails(props) {

  const {
    theme, student, index, isHelping, setIsHelping, helpIdx,
    removeRef, confirmRemove, handleRemoveButton, handleClickHelp
  } = props

  const status = student.status

  switch(status) {
    case 0: {
      if (index == helpIdx) {
        return (
          YouAreHelping(props)
        )
      } else {
        return (StudentIsHelped(props))
      }
    }
    case 1:
      return 
    default:
      // code block
  }

  return (
    <TableCell padding='none' align="center">
      {(isHelping && (index == helpIdx)) ? 
      <Stack sx={{ pt: 1, pb: 1}}>
        <Typography fontSize='14px' color={theme.palette.success.main}>You are helping</Typography>
        <Stack direction='row' justifyContent='center' spacing={2} sx={{ marginRight: '10px' }}>
          <Button variant='contained' color='cancel' sx={{ width: '40%' }} onClick={() => setIsHelping(false)}>Cancel</Button>
          <Button variant='contained' color='info' sx={{ width: '40%' }} 
                  ref={removeRef} onClick={() => handleRemoveButton()}
          >
            Done
          </Button>
        </Stack>
      </Stack>
      :
      (<Toolbar sx={{alignItems: 'right', justifyContent:'flex-end'}}>
        {!isHelping && <div>
          <Button color="info" variant="contained" onClick={() => handleClickHelp(index)} sx={{m:0.5}}>Help</Button>
        </div>}

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

      </Toolbar>)
    }
  </TableCell>
  )
}