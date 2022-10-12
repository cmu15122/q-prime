import React from 'react';
import {
  Typography,
} from '@mui/material';

import AdminMain from './admin/AdminMain';
import VideoChatSettings from './VideoChatSettings';
import NotificationSettings from './NotificationSettings';

function Main(props) {
  const {queueData} = props;

  return (
    <div>
      <Typography variant="h3" textAlign='center' sx={{mt: 4, mb: 2}} fontWeight='bold'>
        Settings
      </Typography>
      {
        !queueData?.isOwner && <VideoChatSettings queueData={queueData}/>
      }
      {
        !queueData?.isOwner && <NotificationSettings queueData={queueData}/>
      }

      {
        queueData?.isAdmin && <AdminMain queueData={queueData}/>
      }
    </div>
  );
}

export default Main;
