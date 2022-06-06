import React, { useState } from 'react';
import VideoChatSettings from './VideoChatSettings';
import NotificationSettings from './NotificationSettings';


function Main (props) {
    return (
        <div>
            <VideoChatSettings theme={props.theme}/>
            <NotificationSettings theme={props.theme}/>
        </div>
    );
}
  
export default Main;