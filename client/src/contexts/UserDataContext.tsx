import {UserData} from '../../../types/UserData';
import React, {createContext, useEffect, useState} from 'react';
import HomeService from '../services/HomeService';

const UserDataContext = createContext({
  userData: {} as UserData,
  setUserData: ((userData: UserData) => {}) as React.Dispatch<React.SetStateAction<UserData>>,
  isLoadingUserData: true,
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

  const [isLoadingUserData, setIsLoadingUserData] = useState<boolean>(true);

  useEffect(() => {
    HomeService.getUserData().then((res) => {
      setUserData(res.data.userData);
      setIsLoadingUserData(false);
    });
  }, []);

  return (
    <UserDataContext.Provider value={{userData, setUserData, isLoadingUserData}}>
      {children}
    </UserDataContext.Provider>
  );
};

export {UserDataContext, UserDataContextProvider};
