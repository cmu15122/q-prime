import React, {useContext} from 'react';
import {
  Typography,
} from '@mui/material';

import ConfigSettings from './ConfigSettings';
import Locations from './Locations';
import QueueRejoinSettings from './QueueRejoinSettings';
import QueueTopicSettings from './QueueTopicSettings';
import TASettings from './TASettings';
import {AdminSettingsContext} from '../../../contexts/AdminSettingsContext';

function AdminMain(props) {
  const {adminSettings} = useContext(AdminSettingsContext);

  return (
    <div style={{paddingBottom: '80px'}}>
      <Typography variant="h4" textAlign='center' sx={{my: 4}} fontWeight='bold'>
        Admin Settings
      </Typography>

      <ConfigSettings></ConfigSettings>
      <QueueRejoinSettings></QueueRejoinSettings>
      { adminSettings.currSem && <QueueTopicSettings></QueueTopicSettings> }
      { adminSettings.currSem && <Locations></Locations> }
      { adminSettings.currSem && <TASettings></TASettings> }
    </div>
  );
}

export default AdminMain;
