import React from 'react';
import ConfigSettings from './ConfigSettings'
import QueueRejoinSettings from './QueueRejoinSettings'
import QueueTopicSettings from './QueueTopicSettings'
import TASettings from './TASettings'

function AdminMain (props) {
    return (
        <div>
          <ConfigSettings theme={props.theme}></ConfigSettings>
          <QueueRejoinSettings theme={props.theme}></QueueRejoinSettings>
          <QueueTopicSettings theme={props.theme}></QueueTopicSettings>
          <TASettings theme={props.theme}></TASettings>
      </div>
    );
}
  
export default AdminMain;
