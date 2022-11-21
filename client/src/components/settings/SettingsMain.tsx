import React, {useContext} from 'react';
import {
  Typography,
} from '@mui/material';

import AdminMain from './admin/AdminMain';
import VideoChatSettings from './VideoChatSettings';
import NotificationSettings from './NotificationSettings';
import {useQueueDataContext} from '../../App';

function Main(props) {
  const {queueData} = useQueueDataContext();

  return (
    <div>
      <Typography variant="h3" textAlign='center' sx={{mt: 4, mb: 2}} fontWeight='bold'>
        Settings
      </Typography>
      {
        !queueData?.isOwner && <VideoChatSettings/>
      }
      {
        !queueData?.isOwner && <NotificationSettings/>
      }

      {
        queueData?.isAdmin && <AdminMain/>
      }
    </div>
  );
}

export default Main;
