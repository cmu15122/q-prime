import React, {useContext} from 'react';
import {
  Typography,
} from '@mui/material';

import AdminMain from './admin/AdminMain';
import VideoChatSettings from './VideoChatSettings';
import NotificationSettings from './NotificationSettings';
import {UserDataContext} from '../../App';

function Main(props) {
  const {userData} = useContext(UserDataContext);

  return (
    <div>
      <Typography variant="h3" textAlign='center' sx={{mt: 4, mb: 2}} fontWeight='bold'>
        Settings
      </Typography>
      {
        !userData.isOwner && <VideoChatSettings/>
      }
      {
        !userData.isOwner && <NotificationSettings/>
      }

      {
        userData.isAdmin && <AdminMain/>
      }
    </div>
  );
}

export default Main;
