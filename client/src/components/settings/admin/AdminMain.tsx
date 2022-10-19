import React from 'react';
import {
  Typography,
} from '@mui/material';

import ConfigSettings from './ConfigSettings';
import Locations from './Locations';
import QueueRejoinSettings from './QueueRejoinSettings';
import QueueTopicSettings from './QueueTopicSettings';
import TASettings from './TASettings';

function AdminMain(props) {
  const {queueData} = props;

  return (
    <div style={{paddingBottom: '80px'}}>
      <Typography variant="h4" textAlign='center' sx={{my: 4}} fontWeight='bold'>
        Admin Settings
      </Typography>

      <ConfigSettings queueData={queueData}></ConfigSettings>
      <QueueRejoinSettings queueData={queueData}></QueueRejoinSettings>
      { queueData.adminSettings.currSem && <QueueTopicSettings queueData={queueData}></QueueTopicSettings> }
      { queueData.adminSettings.currSem && <Locations queueData={queueData}></Locations> }
      { queueData.adminSettings.currSem && <TASettings queueData={queueData}></TASettings> }
    </div>
  );
}

export default AdminMain;
