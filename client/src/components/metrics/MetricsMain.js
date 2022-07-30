import React from 'react';
import {
    Typography
} from '@mui/material';

import DateTimeSelector from './DateTimeSelector';
import PersonalStats from './PersonalStats';
import OverallStats from './OverallStats';
import CumulativeStats from './CumulativeStats';
import Graph from './Graph';

export default function MetricsMain(props) {
    const { theme, queueData } = props;

    return (
        <div>
            <Typography variant="h3" textAlign='center' sx={{ mt: 4 }} fontWeight='bold'>
                Metrics
            </Typography>
            <DateTimeSelector theme={props.theme}/>
            <PersonalStats theme={props.theme}/>
            <OverallStats theme={props.theme}/>
            <CumulativeStats theme={props.theme}/>
            <Graph theme={props.theme}/>
        </div>
    );
}
