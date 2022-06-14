import React from 'react';
import {
  Typography
} from '@mui/material';

import ConfigSettings from './ConfigSettings'
import QueueRejoinSettings from './QueueRejoinSettings'
import QueueTopicSettings from './QueueTopicSettings'
import TASettings from './TASettings'

function AdminMain (props) {
    return (
      <div>
          <Typography variant="h4" textAlign='center' sx={{ my: 4}} fontWeight='bold'>
            Admin Settings
          </Typography>

          <ConfigSettings theme={props.theme}></ConfigSettings>
          <QueueRejoinSettings theme={props.theme}></QueueRejoinSettings>
          <QueueTopicSettings theme={props.theme}></QueueTopicSettings>
          <TASettings theme={props.theme}></TASettings>
      </div>
    );
}
  
export default AdminMain;
