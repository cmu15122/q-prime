import React, { useState } from 'react';
import ConfigSettings from './ConfigSettings'
import QueueRejoinSettings from './QueueRejoinSettings'
import QueueTopicSettings from './QueueTopicSettings'
import TASettings from './TASettings'

import Navbar from '../navbar/Navbar';

function AdminMain (props) {
    return (
        <div>
          <Navbar theme={props.theme} queueData={props.queueData}/>
          <ConfigSettings theme={props.theme}></ConfigSettings>
          <QueueRejoinSettings theme={props.theme}></QueueRejoinSettings>
          <QueueTopicSettings theme={props.theme}></QueueTopicSettings>
          <TASettings theme={props.theme}></TASettings>
      </div>
    );
}
  
export default AdminMain;
