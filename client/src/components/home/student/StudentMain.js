import React, { useEffect, useState } from 'react';

import YourEntry from './YourEntry';
import RemoveQOverlay from './RemoveQConfirm';
import FrozenOverlay from './FrozenOverlay';
import TAHelpingOverlay from './TAHelpingOverlay';
import UpdateQuestionOverlay from './UpdateQuestionOverlay';
import MessageRespond from './MessageOverlay'
import AskQuestion from './AskQuestion';
import CooldownViolationOverlay from './CooldownViolationOverlay';

import HomeService from '../../../services/HomeService';
import { StudentStatusValues } from '../../../services/StudentStatus';
import { socketSubscribeTo } from '../../../services/SocketsService';

function StudentMain(props) {
    const { theme, queueData, studentData } = props;

    const [questionValue, setQuestionValue] = useState('');
    const [locationValue, setLocationValue] = useState('');
    const [topicValue, setTopicValue] = useState('');
    const [messageValue, setMessageValue] = useState('');

    const [removeConfirm, setRemoveConfirm] = useState(false);
    const [showCooldownOverlay, setShowCooldownOverlay] = useState(false);

    const [frozen, setFrozen] = useState(false);
    const [status, setStatus] = useState(StudentStatusValues.OFF_QUEUE);
    const [timePassed, setTimePassed] = useState(0)
    const [position, setPosition] = useState(0);

    const [helpingTAInfo, setHelpingTAInfo] = useState(null);

    useEffect(() => {
        if (!("Notification" in window)) {
            console.log("This browser does not support desktop notification");
        } else {
            Notification.requestPermission();
        }

        socketSubscribeTo("help", (res) => {
            if (res.andrewID === queueData.andrewID) {
                setStatus(StudentStatusValues.BEING_HELPED);
                setHelpingTAInfo(res.data.taData);
                new Notification("It's your turn to get help!", {
                    "body": `${res.data.taData.taName} is ready to help you.`,
                    "requireInteraction": true
                });
            }
        });

        socketSubscribeTo("unhelp", (res) => {
            if (res.andrewID === queueData.andrewID) {
                setStatus(StudentStatusValues.WAITING);
                setHelpingTAInfo(null);
            }
        });

        socketSubscribeTo("updateQRequest", (res) => {
            if (res.andrewID === queueData.andrewID) {
                setFrozen(true);
                setStatus(StudentStatusValues.FIXING_QUESTION)
                new Notification("Please update your question", {
                    "requireInteraction": true
                });
            }
        })

        socketSubscribeTo("message", (res) => {
            if (res.andrewID === queueData.andrewID) {
                setStatus(StudentStatusValues.RECEIVED_MESSAGE);
                setMessageValue(res.data.studentData.message);
                setHelpingTAInfo(res.data.taData);
            }
        });

        socketSubscribeTo("remove", (res) => {
            if (res.andrewID === queueData.andrewID) {
                setStatus(StudentStatusValues.OFF_QUEUE);

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
                setStatus(StudentStatusValues.OFF_QUEUE);
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
                setStatus(StudentStatusValues.WAITING);
            }
        });
    };

    const cancelCooldownJoin = () => {
        setStatus(StudentStatusValues.OFF_QUEUE);
    };

    return (
        <div>
            {
                (status !== StudentStatusValues.OFF_QUEUE) ?
                    <div>
                        <YourEntry
                            openRemoveOverlay={() => setRemoveConfirm(true)}
                            position={position}
                            location={locationValue}
                            topic={topicValue.name}
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
                        setTimePassed={setTimePassed}
                        setShowCooldownOverlay={setShowCooldownOverlay}
                        queueData={queueData}
                        theme={theme}
                    />
            }

            <TAHelpingOverlay
                open={status === StudentStatusValues.BEING_HELPED}
                helpingTAInfo={helpingTAInfo}
            />

            <CooldownViolationOverlay
                open={showCooldownOverlay}
                setOpen={setShowCooldownOverlay}
                setStatus={setStatus}
                timePassed={timePassed}
                questionValue={questionValue}
                locationValue={locationValue}
                topicValue={topicValue}
                setPosition={setPosition}
                cancelCooldownJoin={cancelCooldownJoin}
                queueData={queueData}
            />

            <UpdateQuestionOverlay
                open={status === StudentStatusValues.FIXING_QUESTION}
                handleClose={() => {setStatus(StudentStatusValues.WAITING);}}
                questionValue = {questionValue}
                setQuestionValue={setQuestionValue}
                andrewID = {studentData.andrewID}
            />

            <MessageRespond 
                open={status === StudentStatusValues.RECEIVED_MESSAGE} 
                message={messageValue}
                helpingTAInfo={helpingTAInfo}
                removeFromQueue={removeFromQueue}
                dismissMessage={dismissMessage}
            />
        </div>
    );
}

export default StudentMain;
