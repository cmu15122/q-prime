import React, { useState, useEffect } from 'react';
import {
    CardContent, Checkbox, FormControlLabel, Grid, TextField, Typography, 
} from '@mui/material';

import BaseCard from '../common/cards/BaseCard';

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

    const updateNotifSettings = (joinEnabled, remindEnabled, time) => {
        SettingsService.updateNotifSettings({
            joinEnabled: joinEnabled,
            remindEnabled: remindEnabled,
            remindTime: time
        });
    };

    return (
        <BaseCard>
            <CardContent>
                <Typography sx={{ fontWeight: 'bold', ml: 1, mt: 1}} variant="body1" gutterBottom>
                    Notification Settings
                </Typography>
                <Grid container spacing={1}>
                    <Grid className="d-flex" item sx={{ mb: -1 }} xs={12}>
                    <FormControlLabel control={
                            <Checkbox 
                                size="small" 
                                sx={{ ml: 1 }}
                                checked={joinNotifsEnabled ?? false}
                                onChange={(e) => {
                                    let isJoinNotifsEnabled = e.target.checked;
                                    setJoinNotifsEnabled(isJoinNotifsEnabled);
                                    updateNotifSettings(isJoinNotifsEnabled, remindNotifsEnabled, remindTime);
                                }}
                            />
                        } 
                        label={
                            <div>
                                Enable queue join notifications
                            </div>
                        }
                    />
                    </Grid>
                    <Grid className="d-flex" item xs={12}>
                        <FormControlLabel 
                            control={
                                <Checkbox 
                                    size="small" 
                                    sx={{ ml: 1 }}
                                    checked={remindNotifsEnabled ?? false}
                                    onChange={(e) => {
                                        let isRemindNotifsEnabled = e.target.checked;
                                        setRemindNotifsEnabled(isRemindNotifsEnabled);
                                        updateNotifSettings(joinNotifsEnabled, isRemindNotifsEnabled, remindTime);
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
                                        inputProps={{ style: { textAlign: 'center' }, min: 0 }}
                                        value={remindTime ?? 15}
                                        onChange={(e) => {
                                            let newRemindTime = parseInt(e.target.value, 10);
                                            setRemindTime(newRemindTime);
                                            updateNotifSettings(joinNotifsEnabled, remindNotifsEnabled, newRemindTime);
                                        }}
                                    /> 
                                    minutes
                                </div>
                            } />
                    </Grid>
                </Grid>
            </CardContent>
        </BaseCard>
    );
}