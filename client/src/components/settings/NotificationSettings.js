import React, { useState } from 'react';
import {
    FormControlLabel, Checkbox, Card, CardContent, Typography, TextField, Grid
} from '@mui/material'


export default function NotificationSettings(props) {
    const { } = props
    return (
        <div className='card' style={{ display:'flex' }}>
            <Card sx={{ minWidth: '80%', mx: 'auto', mt: 5 }}>
                <CardContent>
                    <Typography sx={{ fontSize: 16, fontWeight: 'bold', ml: 1, mt: 1}} variant="h5" gutterBottom>
                        Notification Settings
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid className="d-flex" item xs={12}>
                        <FormControlLabel control={<Checkbox size="small" sx={{ ml: 1}}/>} label="Enable queue join notifications" sx={{mt: 1}}/>
                        </Grid>
                        <Grid className="d-flex" item sx={{ mt: -3 }} xs={12}>
                            <FormControlLabel control={<Checkbox size="small" sx={{ ml: 1 }}/>} 
                            label={<p>Remind me after I've been helping for 
                                <TextField id="time-notif" variant="standard" sx={{ mr: 1, ml: 1, mt: -1 }} style={{ width: '50px' }}/> 
                                minutes</p>} />
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        </div>
    );
}