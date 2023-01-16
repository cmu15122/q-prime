import React, {createContext, useEffect, useState, useContext} from 'react';
import {StudentData} from '../../../types/StudentData';
import {UserDataContext} from '../contexts/UserDataContext';
import HomeService from '../services/HomeService';
import {socketSubscribeTo} from '../services/SocketsService';
import {StudentStatusValues} from '../services/StudentStatus';

const StudentDataContext = createContext({
  studentData: {
    name: '',
    andrewID: '',
    taID: -1,
    taAndrewID: '',
    location: '',
    topic: {
      assignment_id: -1,
      name: '',
    },
    question: '',
    isFrozen: false,
    message: '',
    messageBuffer: [],
    status: StudentStatusValues.OFF_QUEUE as number,
    position: -1,
  } as StudentData,
  setStudentData: ((studentData: StudentData) => {}) as React.Dispatch<React.SetStateAction<StudentData>>,
});

const StudentDataContextProvider = ({children}: {children: React.ReactNode}) => {
  const {userData} = useContext(UserDataContext);
  const [studentData, setStudentData] = useState<StudentData>({
    name: '',
    andrewID: '',
    taID: -1,
    taAndrewID: '',
    location: '',
    topic: {
      assignment_id: -1,
      name: '',
    },
    question: '',
    isFrozen: false,
    message: '',
    messageBuffer: [],
    status: StudentStatusValues.OFF_QUEUE as number,
    position: -1,
  });

  useEffect(() => {
    if (userData.isAuthenticated) {
      HomeService.getStudentData().then((res) => {
        if (res.status === 200 && res.data.andrewID === userData.andrewID) {
          setStudentData(res.data);
        }
      });

      socketSubscribeTo('studentData', (data: StudentData) => {
        if (data.andrewID === userData.andrewID) {
          setStudentData(data);
        }
      });
    }
  }, [userData.isAuthenticated]);

  return (
    <StudentDataContext.Provider value={{studentData, setStudentData}}>
      {children}
    </StudentDataContext.Provider>
  );
};

export {StudentDataContext, StudentDataContextProvider};
