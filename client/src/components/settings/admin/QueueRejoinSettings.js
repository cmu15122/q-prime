
import React, { useState, useEffect } from 'react';
import {
    Button, Card, CardContent, Typography, TextField, Grid
} from '@mui/material';

import SettingsService from '../../../services/SettingsService';

export default function QueueRejoinSettings(props) {
    const { queueData } = props

    const [ rejoinTime, setRejoinTime ] = useState(0);

    useEffect(() => {
        if (queueData != null && queueData.adminSettings != null) {
            setRejoinTime(queueData.adminSettings.rejoinTime);
        }
    }, [queueData]);

    const onSubmit = event => {
        event.preventDefault();
        if (rejoinTime === queueData.adminSettings.rejoinTime) return;
        
        SettingsService.updateRejoinTime(
            JSON.stringify({
                rejoinTime: rejoinTime,
            })
        );
    };

    return (
        <div className='card' style={{ display:'flex' }}>
            <Card sx={{ minWidth: '100%' }}>
                <CardContent>
                    <Typography sx={{ fontSize: 16, fontWeight: 'bold', ml: 1, mt: 1}} variant="h5" gutterBottom>
                        Queue Rejoin Settings
                    </Typography>
                    <form onSubmit={onSubmit}>
                        <Grid container spacing={1}>
                            <Grid className="d-flex" item sx={{ mt: 1, ml: 1 }}>
                                Allow students to rejoin the queue after
                                <TextField 
                                    id="current-sem" 
                                    type="number" 
                                    variant="standard" 
                                    sx={{ mx: 1, mt: -1 }} 
                                    style={{ width: '50px' }}
                                    value={rejoinTime}
                                    onChange={(e) => {
                                        setRejoinTime(e.target.value)
                                    }}
                                    inputProps={{ min: 0, style: { textAlign: 'center' } }}
                                />
                                minute(s)
                            </Grid>
                            <Grid className="d-flex" item sx={{ mx: 1 }}>
                                <Button type="submit" variant="contained">Save</Button>
                            </Grid>
                        </Grid>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
