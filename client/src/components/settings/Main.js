
import React, { useState } from 'react';
import VideoChatSettings from './VideoChatSettings';
import NotificationSettings from './NotificationSettings';
import Navbar from '../navbar/Navbar';

function Main (props) {
    return (
        <div>
            <Navbar theme={props.theme} queueData={props.queueData}/>
            <VideoChatSettings theme={props.theme}/>
            <NotificationSettings theme={props.theme}/>
        </div>
    );
}
  
export default Main;