import React from 'react';
import {
    Typography
} from '@mui/material';

import DateTimeSelector from './DateTimeSelector';
import PersonalStats from './PersonalStats';

function MetricsMain (props) {
    const { theme, queueData } = props;
    
    return (
        <div>
            <Typography variant="h3" textAlign='center' sx={{ mt: 4 }} fontWeight='bold'>
                Metrics
            </Typography>
            <DateTimeSelector theme={props.theme}/>
            <PersonalStats theme={props.theme}/>
        </div>
    );
}

export default MetricsMain