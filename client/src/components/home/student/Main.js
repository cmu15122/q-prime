import React, { useState } from 'react';
import {
    Box,
    Button
} from '@mui/material'
import YourEntry from './YourEntry';
import RemoveQOverlay from './RemoveQConfirm';
import FrozenOverlay from './FrozenOverlay';
import TAHelpingOverlay from './TAHelpingOverlay';
import UpdateQuestionOverlay from './UpdateQuestionOverlay';
import MessageRespond from './MessageRespond'

function Main () {
    const [removeConfirm, setRemoveConfirm] = useState(false);
    const [frozen, setFrozen] = useState(false);
    const [taHelping, setTAHelping] = useState(false);
    const [updateQ, setUpdateQ] = useState(false);

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
          <Button variant='outlined' onClick={() => setTAHelping(true)}>Open TA Helping Overlay</Button>
          <TAHelpingOverlay
            open={taHelping}
            handleClose={() => setTAHelping(false)}
          />
          <Button variant='outlined' onClick={() => setUpdateQ(true)}>Open Update Question Overlay</Button>
          <UpdateQuestionOverlay
            open={updateQ}
            handleClose={() => setUpdateQ(false)}
          />
          <MessageRespond 

          />
      </div>
    );
}
  
export default Main;
