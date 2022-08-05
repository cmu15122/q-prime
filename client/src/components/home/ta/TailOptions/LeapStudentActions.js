import * as React from 'react';
import {
  Button, Toolbar
} from '@mui/material'

import PersistentOptions from './PersistentOptions';


export default function LeapStudentActions(props) {

  const {
    theme, student, approveCooldownOverride, index,
  } = props

  return (
    <Toolbar sx={{ alignItems: 'right', justifyContent: 'flex-end' }}>
      <div>
        <Button color="success" variant="contained" onClick={() => approveCooldownOverride()} sx={{ m: 0.5 }}>Approve</Button>
      </div>

      {PersistentOptions(props)}

    </Toolbar>
  )
}
