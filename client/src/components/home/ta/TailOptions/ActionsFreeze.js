import * as React from 'react';
import {
    TableRow, TableCell, IconButton, Button, Toolbar, Stack, Typography
} from '@mui/material'

import PersistentOptions from './PersistentOptions';

export default function ActionsFreeze(props) {

  const {
    theme, student, index, isHelping, setIsHelping, helpIdx,
    removeRef, confirmRemove, handleRemoveButton, handleClickHelp, handleClickUnfreeze
  } = props

  return (
    <Toolbar sx={{justifyContent:'flex-end', justifySelf: 'flex-end'}}>
        <div>
            <Button color="unfreeze" variant="contained" onClick={() => handleClickUnfreeze(index)} sx={{m:0.5}}>Unfreeze</Button>
        </div>
        {PersistentOptions(props)}

    </Toolbar>
  )
}