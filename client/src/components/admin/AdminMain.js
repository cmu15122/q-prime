import React, { useState } from 'react';
import ConfigSettings from './ConfigSettings'
import QueueRejoinSettings from './QueueRejoinSettings'
import QueueTopicSettings from './QueueTopicSettings'
import TASettings from './TASettings'

import LoginAdminNavbar from '../navbar/LoginAdminNavbar'

function AdminMain (props) {
    return (
      <div>
          <LoginAdminNavbar theme={props.theme}/>
          <ConfigSettings theme={props.theme}></ConfigSettings>
          <QueueRejoinSettings theme={props.theme}></QueueRejoinSettings>
          <QueueTopicSettings theme={props.theme}></QueueTopicSettings>
          <TASettings theme={props.theme}></TASettings>
      </div>
    );
}
  
export default AdminMain;
