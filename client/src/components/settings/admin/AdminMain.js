import React from 'react';
import {
  Typography
} from '@mui/material';

import ConfigSettings from './ConfigSettings'
import QueueRejoinSettings from './QueueRejoinSettings'
import QueueTopicSettings from './QueueTopicSettings'
import TASettings from './TASettings'

function AdminMain (props) {
  const { theme, queueData } = props;

  return (
    <div style={{ paddingBottom: '80px' }}>
      <Typography variant="h4" textAlign='center' sx={{ my: 4}} fontWeight='bold'>
        Admin Settings
      </Typography>

      <ConfigSettings theme={theme} queueData={queueData}></ConfigSettings>
      <QueueRejoinSettings theme={theme} queueData={queueData}></QueueRejoinSettings>
      { queueData.adminSettings.currSem && <QueueTopicSettings theme={theme} queueData={queueData}></QueueTopicSettings> }
      { queueData.adminSettings.currSem && <TASettings theme={theme} queueData={queueData}></TASettings> }
    </div>
  );
}
  
export default AdminMain;
