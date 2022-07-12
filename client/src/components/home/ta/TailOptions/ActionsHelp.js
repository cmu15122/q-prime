import * as React from 'react';
import {
  Button, Toolbar
} from '@mui/material'

import PersistentOptions from './PersistentOptions';

export default function ActionsHelp(props) {

  const {
    theme, student, index, isHelping, setIsHelping, helpIdx,
    removeRef, confirmRemove, handleRemoveButton, handleClickHelp
  } = props

  return (
    <Toolbar sx={{alignItems: 'right', justifyContent:'flex-end'}}>
        <div>
          <Button disabled={student.status == 0 || isHelping} color="info" variant="contained" onClick={() => handleClickHelp(index)} sx={{m:0.5}}>Help</Button>
        </div>

        {PersistentOptions(props)}

    </Toolbar>
  )
}