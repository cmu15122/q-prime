import React, {useContext, useEffect, useState} from 'react';

import YourEntry from './YourEntry';
import RemoveQOverlay from './RemoveQConfirm';
import TAHelpingOverlay from './TAHelpingOverlay';
import UpdateQuestionOverlay from './UpdateQuestionOverlay';
import MessageRespond from './MessageOverlay';
import AskQuestion from '../shared/AskQuestion';

import HomeService from '../../../services/HomeService';
import {StudentStatusValues} from '../../../services/StudentStatus';
import {socketSubscribeTo, socketUnsubscribeFrom} from '../../../services/SocketsService';
import {QueueDataContext, StudentDataContext, UserDataContext} from '../../../App';

function StudentMain() {
  // const [questionValue, setQuestionValue] = useState('');
  // const [locationValue, setLocationValue] = useState('');
  // const [topicValue, setTopicValue] = useState('');
  // const [messageValue, setMessageValue] = useState('');

  const [removeConfirm, setRemoveConfirm] = useState(false);

  // const [frozen, setFrozen] = useState(false);
  // const [status, setStatus] = useState(StudentStatusValues.OFF_QUEUE);
  // const [position, setPosition] = useState(0);

  const [helpingTAInfo, setHelpingTAInfo] = useState(null);

  const {queueData} = useContext(QueueDataContext);
  const {studentData, setStudentData} = useContext(StudentDataContext);
  const {userData} = useContext(UserDataContext);

  useEffect(() => {
    if (!('Notification' in window)) {
      console.log('This browser does not support desktop notification');
    } else if (Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    socketSubscribeTo('add', (res) => {
      if (res.studentData.andrewID === userData.andrewID) {
        setStudentData({...studentData, ...res.studentData});
      }
    });

    socketSubscribeTo('help', (res) => {
      if (res.andrewID === userData.andrewID) {
        setStudentData({...studentData, status: StudentStatusValues.BEING_HELPED});
        setHelpingTAInfo(res.data.taData);
        new Notification('It\'s your turn to get help!', {
          'body': `${res.data.taData.taName} is ready to help you.`,
          'requireInteraction': true,
        });
      }
    });

    socketSubscribeTo('unhelp', (res) => {
      if (res.andrewID === userData.andrewID) {
        setStudentData({...studentData, status: StudentStatusValues.WAITING});
        setHelpingTAInfo(null);
      }
    });

    socketSubscribeTo('updateQRequest', (res) => {
      if (res.andrewID === userData.andrewID) {
        setStudentData({...studentData, status: StudentStatusValues.FIXING_QUESTION, isFrozen: true});
        new Notification('Please update your question', {
          'requireInteraction': true,
        });
      }
    });

    socketSubscribeTo('message', (res) => {
      if (res.andrewID === userData.andrewID) {
        setStudentData({...studentData, status: StudentStatusValues.RECEIVED_MESSAGE, message: res.data.studentData.message});
        setHelpingTAInfo(res.data.taData);

        new Notification('You\'ve been messaged by a TA', {
          'requireInteraction': true,
        });
      }
    });

    socketSubscribeTo('remove', (res) => {
      if (res.andrewID === userData.andrewID) {
        setStudentData({
          ...studentData,
          status: StudentStatusValues.OFF_QUEUE,
          question: '',
          topic: {
            assignment_id: -1,
            name: '',
          },
          location: '',
        });

        new Notification('You\'ve been removed from the queue', {
          'requireInteraction': true,
        });
      }
    });

    socketSubscribeTo('approveCooldown', (res) => {
      if (res.andrewID === userData.andrewID) {
        setStudentData({...studentData, status: res.data.studentData.status, isFrozen: res.data.studentData.isFrozen});

        new Notification('Your entry been approved by a TA', {
          'requireInteraction': true,
        });
      }
    });

    return () => {
      socketUnsubscribeFrom('add');
      socketUnsubscribeFrom('help');
      socketUnsubscribeFrom('unhelp');
      socketUnsubscribeFrom('message');
      socketUnsubscribeFrom('remove');
      socketUnsubscribeFrom('approveCooldown');
    };
  }, [userData.andrewID]);

  // useEffect(() => {
  //   // Check if student is on queue
  //   if (studentData && studentData.position !== -1) {
  //     setStudentValues(studentData);
  //   }
  // }, [studentData]);

  // const setStudentValues = (studentData) => {
  //   setPosition(studentData.position);
  //   setLocationValue(studentData.location);
  //   setTopicValue(studentData.topic);
  //   setQuestionValue(studentData.question);
  //   setMessageValue(studentData.message);
  //   setFrozen(studentData.isFrozen);
  //   setHelpingTAInfo(studentData.helpingTA);
  //   setStatus(studentData.status);
  // };

  const removeFromQueue = () => {
    HomeService.removeStudent(
        JSON.stringify({
          andrewID: userData.andrewID,
        }),
    ).then((res) => {
      if (res.status === 200) {
        setRemoveConfirm(false);
        setStudentData({...studentData, status: StudentStatusValues.OFF_QUEUE});
      }
    });
  };

  const dismissMessage = () => {
    HomeService.dismissMessage(
        JSON.stringify({
          andrewID: userData.andrewID,
        }),
    ).then((res) => {
      if (res.status === 200) {
        setStudentData({...studentData, status: StudentStatusValues.WAITING});
      }
    });
  };

  return (
    <div>
      {
        (studentData.status !== StudentStatusValues.OFF_QUEUE) ?
          <div>
            <YourEntry
              openRemoveOverlay={() => setRemoveConfirm(true)}
            />
            <RemoveQOverlay
              open={removeConfirm}
              removeFromQueue={() => removeFromQueue()}
              handleClose={() => setRemoveConfirm(false)}
            />
          </div> :
          (queueData.queueFrozen ? null :
            <AskQuestion
            />
          )
      }

      <TAHelpingOverlay
        open={studentData.status === StudentStatusValues.BEING_HELPED}
        helpingTAInfo={helpingTAInfo}
      />

      <UpdateQuestionOverlay
        open={studentData.status === StudentStatusValues.FIXING_QUESTION}
        handleClose={() => {
          setStudentData({...studentData, status: StudentStatusValues.WAITING, isFrozen: false});
        }}
      />

      <MessageRespond
        open={studentData.status === StudentStatusValues.RECEIVED_MESSAGE}
        helpingTAInfo={helpingTAInfo}
        removeFromQueue={removeFromQueue}
        dismissMessage={dismissMessage}
      />
    </div>
  );
}

export default StudentMain;
