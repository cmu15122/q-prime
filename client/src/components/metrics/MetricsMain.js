import React from 'react';
import {
    Typography
} from '@mui/material';

import DateTimeSelector from './DateTimeSelector';

function MetricsMain (props) {
    return (
        <div>
            <Typography variant="h3" textAlign='center' sx={{ mt: 4 }} fontWeight='bold'>
                Metrics
            </Typography>
            <DateTimeSelector theme={props.theme}/>
        </div>
    );
}

export default MetricsMain