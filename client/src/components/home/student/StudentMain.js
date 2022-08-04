import React, { useEffect, useState } from 'react';
import {
    Button
} from '@mui/material'
import YourEntry from './YourEntry';
import RemoveQOverlay from './RemoveQConfirm';
import FrozenOverlay from './FrozenOverlay';
import TAHelpingOverlay from './TAHelpingOverlay';
import UpdateQuestionOverlay from './UpdateQuestionOverlay';
import MessageRespond from './MessageOverlay'
import AskQuestion from './AskQuestion';
import HomeService from '../../../services/HomeService';

import { socketSubscribeTo } from '../../../services/SocketsService';

function StudentMain(props) {
    const { theme, queueData, studentData } = props;

    // TODO: Pull to a separate file?
    const OFF_QUEUE = -1;
    const BEING_HELPED = 0;
    const WAITING = 1;
    const FIXING_QUESTION = 2;
    const FROZEN = 3;
    const COOLDOWN_VIOLATION = 3;
    const RECEIVED_MESSAGE = 5;

    const [questionValue, setQuestionValue] = useState('');
    const [locationValue, setLocationValue] = useState('');
    const [topicValue, setTopicValue] = useState('');
    const [messageValue, setMessageValue] = useState('');

    const [removeConfirm, setRemoveConfirm] = useState(false);
    const [frozen, setFrozen] = useState(false);
    const [status, setStatus] = useState(OFF_QUEUE);
    const [position, setPosition] = useState(0);

    const [helpingTAInfo, setHelpingTAInfo] = useState(null);

    const [askQuestionOrYourEntry, setAskQuestionOrYourEntry] = useState(false);

    useEffect(() => {
        if (!("Notification" in window)) {
            console.log("This browser does not support desktop notification");
        } else {
            Notification.requestPermission();
        }

        socketSubscribeTo("help", (res) => {
            if (res.andrewID === queueData.andrewID) {
                setStatus(BEING_HELPED);
                setHelpingTAInfo(res.data.taData);
                new Notification("It's your turn to get help!", {
                    "body": `${res.data.taData.taName} is ready to help you.`,
                    "requireInteraction": true
                });
            }
        });

        socketSubscribeTo("unhelp", (res) => {
            if (res.andrewID === queueData.andrewID) {
                setStatus(WAITING);
                setHelpingTAInfo(null);
            }
        });

        socketSubscribeTo("message", (res) => {
            if (res.andrewID === queueData.andrewID) {
                setStatus(RECEIVED_MESSAGE);
                setMessageValue(res.data.studentData.message);
                setHelpingTAInfo(res.data.taData);
            }
        });

        socketSubscribeTo("remove", (res) => {
            if (res.andrewID === queueData.andrewID) {
                setStatus(OFF_QUEUE);

                setQuestionValue("");
                setTopicValue("");
                setLocationValue("");

                new Notification("You've been removed from the queue", {
                    "requireInteraction": true
                });
            }
        });
    }, []);

    // check if student on queue on page load
    useEffect(() => {
        if (studentData.position !== -1) {
            setPosition(studentData.position);
            setLocationValue(studentData.location);
            setTopicValue(studentData.topic);
            setQuestionValue(studentData.question);
            setMessageValue(studentData.message);
            setFrozen(studentData.isFrozen);
            setHelpingTAInfo(studentData.helpingTA);

            let status = studentData.status;
            setStatus(status);
            // if (status === 0) {
            //     setTAHelping(true);
            // } else if (status === 1) {
            //     setTAHelping(false);
            // } else if (status === 2) {
            //     setUpdateQ(true);
            //     console.log(updateQ)
            // } else if (status === 3) {
            //     setFrozen(true);
            // } else if (status === 4) {
            //     setFrozen(true);
            //     // cooldown violation
            // } else if (status === 5) {
            //     setReceivedMessage(true);
            // } else {
            //     console.log("error in status");
            // }
        }
    }, [studentData]);

    const removeFromQueue = () => {
        HomeService.removeStudent(
            JSON.stringify({
                andrewID: queueData.andrewID
            })
        ).then(res => {
            if (res.status === 200) {
                setRemoveConfirm(false);
                setStatus(OFF_QUEUE);
            }
        });
    };

    const dismissMessage = () => {
        HomeService.dismissMessage(
            JSON.stringify({
                andrewID: queueData.andrewID
            })
        ).then(res => {
            if (res.status === 200) {
                setStatus(WAITING);
            }
        });
    };

    return (
        <div>
            {
                (status !== OFF_QUEUE) ?
                    <div>
                        <YourEntry
                            openRemoveOverlay={() => setRemoveConfirm(true)}
                            position={position}
                            location={locationValue}
                            topic={topicValue}
                            question={questionValue}
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
                        setTopicValue={setTopicValue}
                        setPosition={setPosition}
                        setStatus={setStatus}
                        queueData={queueData}
                        theme={theme}
                    />
            }

            <TAHelpingOverlay
                open={status === BEING_HELPED}
                helpingTAInfo={helpingTAInfo}
            />

            <UpdateQuestionOverlay
                open={status === FIXING_QUESTION}
                setQuestionValue={setQuestionValue}
            />

            <MessageRespond 
                open={status === RECEIVED_MESSAGE} 
                message={messageValue}
                helpingTAInfo={helpingTAInfo}
                removeFromQueue={removeFromQueue}
                dismissMessage={dismissMessage}
            />
        </div>
    );
}

export default StudentMain;
