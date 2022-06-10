import React, { useState } from 'react';
import VideoChatSettings from './VideoChatSettings';
import NotificationSettings from './NotificationSettings';
import LogoutNavbar from '../navbar/LogoutNavbar';
import LoginStudentNavbar from '../navbar/LoginStudentNavbar';
import LoginTANavbar from '../navbar/LoginTANavbar';
import LoginAdminNavbar from '../navbar/LoginAdminNavbar';

function Main (props) {
    return (
        <div>
            <LoginAdminNavbar theme={props.theme}/>
            <VideoChatSettings theme={props.theme}/>
            <NotificationSettings theme={props.theme}/>
        </div>
    );
}
  
export default Main;