import React, {createContext, useEffect, useState, useContext} from 'react';
import {AdminSettings} from '../../../types/AdminSettings';
import {UserDataContext} from './UserDataContext';
import SettingsService from '../services/SettingsService';

const AdminSettingsContext = createContext({
  adminSettings: {
    currSem: '',
    slackURL: undefined,
  },
  setAdminSettings: ((adminSettings: AdminSettings) => {}) as React.Dispatch<React.SetStateAction<AdminSettings>>,
});

const AdminSettingsContextProvider = ({children}: {children: React.ReactNode}) => {
  const {userData} = useContext(UserDataContext);
  const [adminSettings, setAdminSettings] = useState<AdminSettings>({
    currSem: '',
    slackURL: undefined,
  });

  useEffect(() => {
    if (userData.isAdmin) {
      SettingsService.getAdminSettings().then((res) => {
        setAdminSettings(res.data);
      });
    }
  }, [userData.isAdmin]);

  return (
    <AdminSettingsContext.Provider value={{adminSettings, setAdminSettings}}>
      {children}
    </AdminSettingsContext.Provider>
  );
};

export {AdminSettingsContext, AdminSettingsContextProvider};
