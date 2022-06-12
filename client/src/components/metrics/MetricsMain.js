import React, { useState } from 'react';
import Navbar from '../navbar/Navbar';
import DateTimeSelector from './DateTimeSelector';

function MetricsMain (props) {
    return (
        <div>
            <Navbar theme={props.theme} queueData={props.queueData}/>
            <DateTimeSelector theme={props.theme}/>
        </div>
    );
}

export default MetricsMain