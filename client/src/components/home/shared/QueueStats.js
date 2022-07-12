import React, { useState, useEffect } from 'react';
import {
    Typography,
    CardContent,
    Card,
    Toolbar,
    Button
} from '@mui/material';

import { socketSubscribeTo } from '../../../services/SocketsService';

export default function QueueStats(props) {
    const { queueData, queueFrozen } = props;

    const [numStudents, setNumStudents] = useState();
    const [waitTime, setWaitTime] = useState();

    useEffect(() => {
        socketSubscribeTo("waittimes", (data) => {
            setWaitTime(data.times);
        });
    }, []);

    useEffect(() => {
        if (queueData != null) {
            setNumStudents(queueData.numStudents);
            setWaitTime(queueData.waitTime);
        }
    }, [queueData]);

    const textStyle = {
        borderRight: "0.1em solid black",
        padding: "0.5em",
        paddingBottom: "0em",
        paddingRight: "2em"
    };

    return (
        <div>
            <div className='card' style={{display:'flex'}}>
                <Card sx={{ minWidth : '100%'}}>
                    <CardContent>
                        <Toolbar sx={{alignItems: 'center', justifyContent:'center'}}>
                            <div>
                                <Typography variant='h5' style={textStyle} sx={{fontWeight: 'bold', textAlign: 'center'}}>The queue is</Typography>
                                {
                                    queueFrozen ? 
                                    <Typography color="red" variant='h5' style={textStyle} sx={{fontWeight: 'bold', textAlign: 'center'}}>CLOSED</Typography>
                                    : 
                                    <Typography color="green" variant='h5' style={textStyle} sx={{fontWeight: 'bold', textAlign: 'center'}}>OPEN</Typography>
                                }
                            </div>
                            <div width="50%">
                                <Typography variant='body1' style={{padding: "0.5em", paddingLeft: "2em"}}>There are <strong>{numStudents} students</strong> on the queue.</Typography>
                                <Typography variant='body1' style={{padding: "0.5em", paddingLeft: "2em"}}>The estimated wait time is <strong>{waitTime} minutes</strong> from the end of the queue.</Typography>
                            </div>
                        </Toolbar>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
