import {QueueData} from '../../../types/QueueData';
import React, {createContext, useEffect, useState} from 'react';
import HomeService from '../services/HomeService';
import {socketSubscribeTo} from '../services/SocketsService';

const QueueDataContext = createContext({
  queueData: {} as QueueData,
  setQueueData: ((queueData: QueueData) => {}) as React.Dispatch<React.SetStateAction<QueueData>>,
});

const QueueDataContextProvider = ({children}: {children: React.ReactNode}) => {
  const [queueData, setQueueData] = useState<QueueData>({
    title: '15-122 Office Hours Queue',
    uninitializedSem: false,
    queueFrozen: true,

    numStudents: 0,
    rejoinTime: 15,
    waitTime: 0,
    numUnhelped: 0,
    minsPerStudent: 0,
    numTAs: 0,

    announcements: [],
    topics: [],
    locations: {
      dayDictionary: {},
      roomDictionary: {},
    },

    tas: [],
  });

  useEffect(() => {
    HomeService.getAll().then((res) => {
      setQueueData(res.data);
      document.title = res.data.title;
    });

    socketSubscribeTo('queueData', (data: QueueData) => {
      setQueueData(data);
    });
  }, []);

  return (
    <QueueDataContext.Provider value={{queueData, setQueueData}}>
      {children}
    </QueueDataContext.Provider>
  );
};

export {QueueDataContext, QueueDataContextProvider};
