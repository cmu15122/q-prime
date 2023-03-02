import React, {useContext} from 'react';

import Navbar from '../components/navbar/Navbar';
import SettingsMain from '../components/settings/SettingsMain';

import {useTheme} from '@mui/material/styles';
import {CircularProgress} from '@mui/material';
import {Navigate} from 'react-router-dom';

import {UserDataContext} from '../contexts/UserDataContext';

/**
 * Settings page, only accessible to TAs and course owners
 */
function Settings() {
  const theme = useTheme();
  const {userData, isLoadingUserData} = useContext(UserDataContext);

  return (
    (isLoadingUserData) ? (
      <CircularProgress />
    ) :
    (
      (userData.isAuthenticated && (userData.isTA || userData.isOwner)) ? (
        <div className="Settings" style={{backgroundColor: theme.palette.background.default}}>
          <Navbar/>
          <SettingsMain/>
        </div>
      ) : (
        <Navigate to={{pathname: '/'}} />
      )
    )
  );
}

export default Settings;
