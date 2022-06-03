import React, { useState } from 'react';
import {
    Box,
    Button
} from '@mui/material'
import YourEntry from './YourEntry';
import RemoveQOverlay from './RemoveQConfirm';
import FrozenOverlay from './FrozenOverlay';

function Main () {
    const [removeConfirm, setRemoveConfirm] = useState(false);
    const [frozen, setFrozen] = useState(false);
    return (
      <div>
          <YourEntry />
          <Button variant='outlined' onClick={() => setRemoveConfirm(true)}>Open Remove Queue Confirm</Button>
          <RemoveQOverlay 
            open={removeConfirm}
            handleClose={() => setRemoveConfirm(false)}
          />
          <Button variant='outlined' onClick={() => setFrozen(true)}>Open Frozen Overlay</Button>
          <FrozenOverlay 
            open={frozen}
            handleClose={() => setFrozen(false)}
          />
      </div>
    );
}
  
export default Main;
