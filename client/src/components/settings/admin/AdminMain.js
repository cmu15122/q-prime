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
    <div>
      <Typography variant="h4" textAlign='center' sx={{ my: 4}} fontWeight='bold'>
        Admin Settings
      </Typography>

      <ConfigSettings theme={theme}></ConfigSettings>
      <QueueRejoinSettings theme={theme}></QueueRejoinSettings>
      <QueueTopicSettings theme={theme} queueData={queueData}></QueueTopicSettings>
      <TASettings theme={theme}></TASettings>
    </div>
  );
}
  
export default AdminMain;
