import React, {useContext} from 'react';
import {
  Typography,
} from '@mui/material';

import ConfigSettings from './ConfigSettings';
import Locations from './Locations';
import QueueRejoinSettings from './QueueRejoinSettings';
import QueueTopicSettings from './QueueTopicSettings';
import TASettings from './TASettings';
import {QueueSettingsContext} from '../../../contexts/QueueSettingsContext';

function AdminMain(props) {
  const {queueSettings} = useContext(QueueSettingsContext);

  return (
    <div style={{paddingBottom: '80px'}}>
      <Typography variant="h4" textAlign='center' sx={{my: 4}} fontWeight='bold'>
        Admin Settings
      </Typography>

      <ConfigSettings></ConfigSettings>
      <QueueRejoinSettings></QueueRejoinSettings>
      { queueSettings.currSem && <QueueTopicSettings></QueueTopicSettings> }
      { queueSettings.currSem && <Locations></Locations> }
      { queueSettings.currSem && <TASettings></TASettings> }
    </div>
  );
}

export default AdminMain;
