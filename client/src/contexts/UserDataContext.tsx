import {UserData} from '../../../types/UserData';
import React, {createContext, useEffect, useState} from 'react';
import HomeService from '../services/HomeService';

/**
 * Context object for user data
 *
 * This context will be loaded for all users
 *
 * This context is **not** updated via sockets
 */
const UserDataContext = createContext({
  userData: {} as UserData,
  setUserData: ((userData: UserData) => {}) as React.Dispatch<React.SetStateAction<UserData>>,
  isLoadingUserData: true,
});

/**
 * Context provider for user data
 * @return {React.Provider} Context provider for user data
 */
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

  // Load user data
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
