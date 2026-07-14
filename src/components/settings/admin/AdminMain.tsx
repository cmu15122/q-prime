import { Typography } from '@mui/material';

import ConfigSettings from './ConfigSettings';
import Locations from './Locations';
import QueueRejoinSettings from './QueueRejoinSettings';
import QueueTopicSettings from './QueueTopicSettings';
import TASettings from './TASettings';
import AccessControlSettings from './AccessControlSettings';
import SqlModuleSettings from './SqlModuleSettings';

function AdminMain() {
  return (
    <div style={{ paddingBottom: '80px' }}>
      <Typography variant="h4" textAlign="center" sx={{ my: 4 }} fontWeight="bold">
        Admin Settings
      </Typography>

      <ConfigSettings></ConfigSettings>
      <QueueRejoinSettings></QueueRejoinSettings>
      <QueueTopicSettings></QueueTopicSettings>
      <Locations></Locations>
      <TASettings></TASettings>
      <AccessControlSettings></AccessControlSettings>
      <SqlModuleSettings></SqlModuleSettings>
    </div>
  );
}

export default AdminMain;
