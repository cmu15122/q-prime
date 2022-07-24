import React, { useState, useEffect } from 'react';
import {
    FormControlLabel, Checkbox, Card, CardContent, Typography, TextField, Grid
} from '@mui/material';

import SettingsService from "../../services/SettingsService";

export default function NotificationSettings(props) {
    const { queueData } = props;

    const [joinNotifsEnabled, setJoinNotifsEnabled] = useState(false);
    const [remindNotifsEnabled, setRemindNotifsEnabled] = useState(false);
    const [remindTime, setRemindTime] = useState(15);

    useEffect(() => {
        if (queueData != null && queueData.settings != null) {
            let settings = queueData.settings;
            setJoinNotifsEnabled(settings.joinNotifsEnabled);
            setRemindNotifsEnabled(settings.remindNotifsEnabled);
            setRemindTime(settings.remindTime);
        }
    }, [queueData]);

    useEffect(() => {
        if (queueData != null) {
            updateNotifSettings();
        }
     }, [joinNotifsEnabled, remindNotifsEnabled, remindTime]);

    const updateNotifSettings = () => {
        SettingsService.updateNotifSettings({
            joinEnabled: joinNotifsEnabled,
            remindEnabled: remindNotifsEnabled,
            remindTime: remindTime
        });
    };

    return (
        <div className='card' style={{ display: 'flex' }}>
            <Card sx={{ minWidth: '100%', mt: 1 }}>
                <CardContent>
                    <Typography sx={{ fontSize: 16, fontWeight: 'bold', ml: 1, mt: 1}} variant="h5" gutterBottom>
                        Notification Settings
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid className="d-flex" item xs={12}>
                        <FormControlLabel control={
                                <Checkbox 
                                    size="small" 
                                    sx={{ ml: 1 }}
                                    checked={joinNotifsEnabled ?? false}
                                    onChange={(e) => {
                                        setJoinNotifsEnabled(e.target.checked);
                                    }}
                                />
                            } 
                            label="Enable queue join notifications" sx={{mt: 1}}
                        />
                        </Grid>
                        <Grid className="d-flex" item sx={{ mt: -3 }} xs={12}>
                            <FormControlLabel 
                                control={
                                    <Checkbox 
                                        size="small" 
                                        sx={{ ml: 1 }}
                                        checked={remindNotifsEnabled ?? false}
                                        onChange={(e) => {
                                            setRemindNotifsEnabled(e.target.checked);
                                        }}
                                    />
                                } 
                                label={
                                    <div>
                                        Remind me after I've been helping for
                                        <TextField 
                                            id="time-notif" 
                                            disabled={!(remindNotifsEnabled ?? false)} 
                                            type="number"
                                            variant="standard"
                                            sx={{ mr: 1, ml: 1, mt: -1 }} 
                                            style={{ width: "50px"}}
                                            inputProps={{ style: { textAlign: 'center', min: 0 } }}
                                            value={remindTime ?? 15}
                                            onChange={(e) => {
                                                setRemindTime(e.target.value);
                                            }}
                                        /> 
                                        minutes
                                    </div>
                                } />
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        </div>
    );
}