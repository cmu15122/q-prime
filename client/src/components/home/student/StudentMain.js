import React, { useEffect, useState } from 'react';
import {
    Button
} from '@mui/material'
import YourEntry from './YourEntry';
import RemoveQOverlay from './RemoveQConfirm';
import FrozenOverlay from './FrozenOverlay';
import TAHelpingOverlay from './TAHelpingOverlay';
import UpdateQuestionOverlay from './UpdateQuestionOverlay';
import MessageRespond from './MessageRespond'
import AskQuestion from './AskQuestion';
import HomeService from '../../../services/HomeService';

function StudentMain (props) {
  const [questionValue, setQuestionValue] = useState('')
  const [locationValue, setLocationValue] = useState('')
  const [topicValue, setTopicValue] = useState('')
  
  const [removeConfirm, setRemoveConfirm] = useState(false);
  const [frozen, setFrozen] = useState(false);
  const [taHelping, setTAHelping] = useState(false);
  const [updateQ, setUpdateQ] = useState(false);
  const [position, setPosition] = useState(0)

  const [askQuestionOrYourEntry, setAskQuestionOrYourEntry] = useState(false)

  // check if student on queue on page load
  useEffect(() => {
    HomeService.getAll()
      .then(res => {
        if(res.data.studentData.position !== -1) {
          setAskQuestionOrYourEntry(true)
          setPosition(res.data.studentData.position)
          setLocationValue(res.data.studentData.location)
          setTopicValue(res.data.studentData.topic)
          setQuestionValue(res.data.studentData.question)
          setFrozen(res.data.studentData.isFrozen)

          let status = res.data.studentData.status
          if(status === 0) {
            setTAHelping(true)
          } else if(status === 1) {
            setTAHelping(false)
          } else if(status === 2) {
            setUpdateQ(true)
            console.log(updateQ)
          } else if(status === 3) {
            setFrozen(true)
          } else if(status === 4) {
            setFrozen(true)
            // cooldown violation
          } else {
            console.log("error in status")
          }
        }
      })
  })

  function removeFromQueue() {

    HomeService.removeStudent().then(res => {
      if(res.status === 200) {
        setRemoveConfirm(false)
        setAskQuestionOrYourEntry(false)
      } else {
        console.log("error in remove from queue")
      }
    })

  }

  return (
    <div>
      {
        askQuestionOrYourEntry ?
        <div>
          <YourEntry
            openRemoveOverlay={() => setRemoveConfirm(true)}
            position={position}
            location={locationValue}
            topic={topicValue}
            question={questionValue}
            setAskQuestionOrYourEntry={setAskQuestionOrYourEntry}
            theme={props.theme}
          />
          <RemoveQOverlay 
            open={removeConfirm}
            removeFromQueue={() => removeFromQueue()}
            handleClose={() => setRemoveConfirm(false)}
          />
        </div>
        :
        <AskQuestion
          questionValue={questionValue}
          setQuestionValue={setQuestionValue}
          locationValue={locationValue}
          setLocationValue={setLocationValue}
          topicValue={topicValue}
          setTopicValue={setTopicValue}
          setPosition={setPosition}
          setAskQuestionOrYourEntry={setAskQuestionOrYourEntry}
          theme={props.theme}
        />
      }
      
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

      <MessageRespond theme = {props.theme} />
    </div>
  );
}
  
export default StudentMain;
