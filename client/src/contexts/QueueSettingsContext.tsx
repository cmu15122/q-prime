import React, {createContext, useEffect, useState, useContext} from 'react';
import {QueueSettings} from '../../../types/QueueSettings';
import {UserDataContext} from '../contexts/UserDataContext';
import SettingsService from '../services/SettingsService';

const QueueSettingsContext = createContext({
  queueSettings: {
    currSem: '',
    slackURL: undefined,
    questionsURL: undefined,
  },
  setQueueSettings: ((queueSettings: QueueSettings) => {}) as React.Dispatch<React.SetStateAction<QueueSettings>>,
});

const QueueSettingsContextProvider = ({children}: {children: React.ReactNode}) => {
  const {userData} = useContext(UserDataContext);
  const [queueSettings, setQueueSettings] = useState<QueueSettings>({
    currSem: '',
    slackURL: undefined,
    questionsURL: undefined,
  });

  useEffect(() => {
    if (userData.isAdmin) {
      SettingsService.getQueueSettings().then((res) => {
        setQueueSettings(res.data);
      });
    }
  }, [userData.isAdmin]);

  return (
    <QueueSettingsContext.Provider value={{queueSettings, setQueueSettings}}>
      {children}
    </QueueSettingsContext.Provider>
  );
};

export {QueueSettingsContext, QueueSettingsContextProvider};
