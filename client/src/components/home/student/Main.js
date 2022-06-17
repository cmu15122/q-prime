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
import QueueStats from './QueueStats'
import AskQuestion from './AskQuestion';
import Announcements from '../Annoucements';

import Footer from '../Footer';
import LoginAdminNavbar from '../../navbar/LoginAdminNavbar'

function Main (props) {
    const gitHubLink = 'https://www.github.com'
    const [questionValue, setQuestionValue] = useState('')
    const [removeConfirm, setRemoveConfirm] = useState(false);
    const [frozen, setFrozen] = useState(false);
    const [taHelping, setTAHelping] = useState(false);
    const [updateQ, setUpdateQ] = useState(false);

    return (
      <div>
          <LoginAdminNavbar theme={props.theme}/>
          <QueueStats theme={props.theme}/>
          <Announcements theme={props.theme}/>
          <YourEntry
            openRemoveOverlay={() => setRemoveConfirm(true)}
            theme={props.theme}
          />
          <RemoveQOverlay 
            open={removeConfirm}
            handleClose={() => setRemoveConfirm(false)}
          />
          <AskQuestion
            questionValue={questionValue}
            setQuestionValue={setQuestionValue}
          />
          <Button variant="contained" onClick={() => setFrozen(true)} sx={{m:0.5}}>Open Frozen Overlay</Button>
          <FrozenOverlay 
            open={frozen}
            handleClose={() => setFrozen(false)}
          />
          <Button variant="contained" onClick={() => setTAHelping(true)} sx={{m:0.5}}>Open TA Helping Overlay</Button>
          
          <TAHelpingOverlay
            open={taHelping}
            handleClose={() => setTAHelping(false)}
          />
          <Button variant="contained" onClick={() => setUpdateQ(true)} sx={{m:0.5}}>Open Update Question Overlay</Button>
        
          <UpdateQuestionOverlay
            open={updateQ}
            handleClose={() => setUpdateQ(false)}
            setQuestionValue={setQuestionValue}
          />
          <MessageRespond theme = {props.theme}
          />

          <Footer gitHubLink={gitHubLink} />
      </div>
    );
}
  
export default Main;
