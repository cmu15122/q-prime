import React, { useState } from 'react';
import LogoutNavbar from '../navbar/LogoutNavbar';
import LoginStudentNavbar from '../navbar/LoginStudentNavbar';
import LoginTANavbar from '../navbar/LoginTANavbar';
import LoginAdminNavbar from '../navbar/LoginAdminNavbar';

function MetricsMain (props) {
    return (
        <div>
            <LoginAdminNavbar theme={props.theme}/>
        </div>
    );
}

export default MetricsMain