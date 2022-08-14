import React, { useEffect, useState } from "react";

import YourEntry from "./YourEntry";
import RemoveQOverlay from "./RemoveQConfirm";
import TAHelpingOverlay from "./TAHelpingOverlay";
import UpdateQuestionOverlay from "./UpdateQuestionOverlay";
import MessageRespond from "./MessageOverlay"
import AskQuestion from "../shared/AskQuestion";

import HomeService from "../../../services/HomeService";
import { StudentStatusValues } from "../../../services/StudentStatus";
import { socketSubscribeTo, socketUnsubscribeFrom } from "../../../services/SocketsService";

function StudentMain(props) {
    const { theme, queueData, studentData } = props;

    const [questionValue, setQuestionValue] = useState("");
    const [locationValue, setLocationValue] = useState("");
    const [topicValue, setTopicValue] = useState("");
    const [messageValue, setMessageValue] = useState("");

    const [removeConfirm, setRemoveConfirm] = useState(false);

    const [frozen, setFrozen] = useState(false);
    const [status, setStatus] = useState(StudentStatusValues.OFF_QUEUE);
    const [position, setPosition] = useState(0);

    const [helpingTAInfo, setHelpingTAInfo] = useState(null);

    useEffect(() => {
        if (!("Notification" in window)) {
            console.log("This browser does not support desktop notification");
        } else if (Notification.permission !== "granted") {
            Notification.requestPermission();
        }
    }, []);

    useEffect(() => {
        socketSubscribeTo("add", (res) => {
            let studentData = res.studentData;
            if (studentData.andrewID === queueData.andrewID) {
                setStudentValues(studentData);
            }
        });

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

                new Notification("You've been messaged by a TA", {
                    "requireInteraction": true
                });
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

        socketSubscribeTo("approveCooldown", (res) => {
            if (res.andrewID === queueData.andrewID) {
                setStatus(res.data.studentData.status);
                setFrozen(res.data.studentData.isFrozen);

                new Notification("Your entry been approved by a TA", {
                    "requireInteraction": true
                });
            }
        });

        return () => {
            socketUnsubscribeFrom("add");
            socketUnsubscribeFrom("help");
            socketUnsubscribeFrom("unhelp");
            socketUnsubscribeFrom("message");
            socketUnsubscribeFrom("remove");
            socketUnsubscribeFrom("approveCooldown");
        };
    }, [queueData.andrewID]);

    useEffect(() => {
        // Check if student is on queue
        if (studentData && studentData.position !== -1) {
            setStudentValues(studentData);
        }
    }, [studentData]);

    const setStudentValues = (studentData) => {
        setPosition(studentData.position);
        setLocationValue(studentData.location);
        setTopicValue(studentData.topic);
        setQuestionValue(studentData.question);
        setMessageValue(studentData.message);
        setFrozen(studentData.isFrozen);
        setHelpingTAInfo(studentData.helpingTA);
        setStatus(studentData.status);
    };

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
                            frozen={frozen}
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
                open={status === StudentStatusValues.BEING_HELPED}
                helpingTAInfo={helpingTAInfo}
            />

            <UpdateQuestionOverlay
                open={status === StudentStatusValues.FIXING_QUESTION}
                handleClose={() => {setStatus(StudentStatusValues.WAITING); setFrozen(false);}}
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
