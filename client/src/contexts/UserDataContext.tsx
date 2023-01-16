import {UserData} from '../../../types/UserData';
import React, {createContext, useEffect, useState} from 'react';
import HomeService from '../services/HomeService';

const UserDataContext = createContext({
  userData: {} as UserData,
  setUserData: ((userData: UserData) => {}) as React.Dispatch<React.SetStateAction<UserData>>,
});

const UserDataContextProvider = ({children}: {children: React.ReactNode}) => {
  const [userData, setUserData] = useState<UserData>({
    isOwner: false,
    isAuthenticated: false,
    isTA: false,
    isAdmin: false,
    andrewID: '',
    preferredName: '',
  });

  useEffect(() => {
    HomeService.getUserData().then((res) => {
      setUserData(res.data.userData);
    });
  }, []);

  return (
    <UserDataContext.Provider value={{userData, setUserData}}>
      {children}
    </UserDataContext.Provider>
  );
};

export {UserDataContext, UserDataContextProvider};
