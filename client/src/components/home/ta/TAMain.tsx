import React, {useContext, useEffect} from 'react';
import {UserDataContext} from '../../../contexts/UserDataContext';
import {socketSubscribeTo} from '../../../services/SocketsService';
import AskQuestion from '../shared/AskQuestion';
import StudentEntries from './StudentEntries';

export default function TAMain(props) {
  const {userData} = useContext(UserDataContext);

  useEffect(() => {
    socketSubscribeTo(`remind/${userData.andrewID}`, (res) => {
      new Notification('Time Alert!', {
        'body': `You've been helping for ${userData.taSettings.remindTime} minutes!`,
        'requireInteraction': true,
      });
    });
  }, []);

  return (
    <div>
      <StudentEntries/>
      <AskQuestion/>
    </div>
  );
}
