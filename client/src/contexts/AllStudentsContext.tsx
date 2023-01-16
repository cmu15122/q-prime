import React, {createContext, useEffect, useState, useContext} from 'react';
import {StudentData} from '../../../types/StudentData';
import {UserDataContext} from '../contexts/UserDataContext';
import HomeService from '../services/HomeService';
import {socketSubscribeTo} from '../services/SocketsService';

const AllStudentsContext = createContext({
  allStudents: [] as StudentData[],
  setAllStudents: ((allStudents: StudentData[]) => {}) as React.Dispatch<React.SetStateAction<StudentData[]>>,
});

const AllStudentsContextProvider = ({children}: {children: React.ReactNode}) => {
  const {userData} = useContext(UserDataContext);
  const [allStudents, setAllStudents] = useState<StudentData[]>([]);

  useEffect(() => {
    if (userData.isTA) {
      HomeService.getAllStudents().then((res) => {
        setAllStudents(res.data.allStudents);
      });

      socketSubscribeTo('allStudents', (data: {allStudents: StudentData[]}) => {
        setAllStudents(data.allStudents);
      });
    }
  }, [userData.isTA]);

  return (
    <AllStudentsContext.Provider value={{allStudents, setAllStudents}}>
      {children}
    </AllStudentsContext.Provider>
  );
};

export {AllStudentsContext, AllStudentsContextProvider};
