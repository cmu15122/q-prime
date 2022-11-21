import React, {useContext} from 'react';
import {
  Typography,
} from '@mui/material';

import ConfigSettings from './ConfigSettings';
import Locations from './Locations';
import QueueRejoinSettings from './QueueRejoinSettings';
import QueueTopicSettings from './QueueTopicSettings';
import TASettings from './TASettings';
import {useQueueDataContext} from '../../../App';

function AdminMain(props) {
  const {queueData} = useQueueDataContext();

  return (
    <div style={{paddingBottom: '80px'}}>
      <Typography variant="h4" textAlign='center' sx={{my: 4}} fontWeight='bold'>
        Admin Settings
      </Typography>

      <ConfigSettings></ConfigSettings>
      <QueueRejoinSettings></QueueRejoinSettings>
      { queueData.adminSettings.currSem && <QueueTopicSettings></QueueTopicSettings> }
      { queueData.adminSettings.currSem && <Locations></Locations> }
      { queueData.adminSettings.currSem && <TASettings></TASettings> }
    </div>
  );
}

export default AdminMain;
