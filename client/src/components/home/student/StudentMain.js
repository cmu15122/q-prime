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
import CooldownViolationOverlay from './CooldownViolationOverlay';
import HomeService from '../../../services/HomeService';

import { socketSubscribeTo } from '../../../services/SocketsService';

function StudentMain(props) {
    const [questionValue, setQuestionValue] = useState('');
    const [locationValue, setLocationValue] = useState('');
    const [topicValue, setTopicValue] = useState('');

    const [removeConfirm, setRemoveConfirm] = useState(false);
    const [frozen, setFrozen] = useState(false);
    const [taHelping, setTAHelping] = useState(false);
    const [showCooldownOverlay, setShowCooldownOverlay] = useState(false)
    const [timePassed, setTimePassed] = useState(0)
    const [updateQ, setUpdateQ] = useState(false);
    const [position, setPosition] = useState(0);

    const [helpingTAInfo, setHelpingTAInfo] = useState(null);

    const [askQuestionOrYourEntry, setAskQuestionOrYourEntry] = useState(false)

    const { theme, queueData, studentData } = props

    useEffect(() => {
        if (!("Notification" in window)) {
            console.log("This browser does not support desktop notification");
        } else {
            Notification.requestPermission();
        }

        socketSubscribeTo("help", (res) => {
            if (res.andrewID === queueData.andrewID) {
                setTAHelping(true);
                setHelpingTAInfo(res.data.taData);
                new Notification("It's your turn to get help!", {
                    "body": `${res.data.taData.taName} is ready to help you.`,
                    "requireInteraction": true
                });
            }
        });

        socketSubscribeTo("unhelp", (res) => {
            if (res.andrewID === queueData.andrewID) {
                setTAHelping(false);
                setHelpingTAInfo(null);
            }
        });

        socketSubscribeTo("remove", (res) => {
            if (res.andrewID === queueData.andrewID) {
                setTAHelping(false);
                setUpdateQ(false);
                setFrozen(false);
                setRemoveConfirm(false);
                setAskQuestionOrYourEntry(false);

                new Notification("You've been removed from the queue", {
                    "requireInteraction": true
                });
            }
        });
    }, []);

    // check if student on queue on page load
    useEffect(() => {
        if (studentData.position !== -1) {
            setAskQuestionOrYourEntry(true);

            setPosition(studentData.position);
            setLocationValue(studentData.location);
            setTopicValue(studentData.topic);
            setQuestionValue(studentData.question);
            setFrozen(studentData.isFrozen);
            setHelpingTAInfo(studentData.helpingTA);

            let status = studentData.status;
            if (status === 0) {
                setTAHelping(true);
            } else if (status === 1) {
                setTAHelping(false);
            } else if (status === 2) {
                setUpdateQ(true);
                console.log(updateQ)
            } else if (status === 3) {
                setFrozen(true);
            } else if (status === 4) {
                setFrozen(true);
                // cooldown violation
            } else {
                console.log("error in status")
            }
        }
    }, [studentData, updateQ])

    function removeFromQueue() {
        HomeService.removeStudent(
            JSON.stringify({
                andrewID: queueData.andrewID
            })
        ).then(res => {
            if (res.status === 200) {
                setRemoveConfirm(false);
                setAskQuestionOrYourEntry(false);
            } else {
                console.log("Error in remove from queue");
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
                            topic={topicValue?.name ?? ''}
                            question={questionValue}
                            setAskQuestionOrYourEntry={setAskQuestionOrYourEntry}
                            theme={theme}
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
                        setShowCooldownOverlay={setShowCooldownOverlay}
                        setTimePassed={setTimePassed}
                        queueData={queueData}
                        theme={theme}
                    />
            }

            <Button variant="contained" onClick={() => setFrozen(true)} sx={{ m: 0.5 }}>Open Frozen Overlay</Button>
            <FrozenOverlay
                open={frozen}
                handleClose={() => setFrozen(false)}
            />

            <TAHelpingOverlay
                open={taHelping}
                helpingTAInfo={helpingTAInfo}
            />

            <Button variant="contained" onClick={() => setShowCooldownOverlay(true)} sx={{ m: 0.5 }}>Open Cooldown Violation Overlay</Button>
            <CooldownViolationOverlay
                open={showCooldownOverlay}
                setOpen={setShowCooldownOverlay}
                timePassed={timePassed}
                questionValue={questionValue}
                locationValue={locationValue}
                topicValue={topicValue}
                setPosition={setPosition}
                setAskQuestionOrYourEntry={setAskQuestionOrYourEntry}
                queueData={queueData}
            />


            <Button variant="contained" onClick={() => setUpdateQ(true)} sx={{ m: 0.5 }}>Open Update Question Overlay</Button>
            <UpdateQuestionOverlay
                open={updateQ}
                handleClose={() => setUpdateQ(false)}
                setQuestionValue={setQuestionValue}
            />

            <MessageRespond theme={theme} />
        </div>
    );
}

export default StudentMain;
