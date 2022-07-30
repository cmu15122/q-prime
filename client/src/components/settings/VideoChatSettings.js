import React, { useState, useEffect } from 'react';
import {
    Button, Collapse, FormGroup, FormControlLabel, Checkbox, Card, 
    CardContent, Typography, TextField, Grid
} from '@mui/material';

import SettingsService from '../../services/SettingsService';

export default function VideoChatSettings(props) {
    const { queueData } = props;

    const [isVideoChatEnabled, setVideoChatEnabled] = useState(false);
    const [videoChatURL, setVideoChatURL] = useState("");

    useEffect(() => {
        if (queueData != null && queueData.settings != null) {
            setVideoChatEnabled(queueData.settings.videoChatEnabled);
            setVideoChatURL(queueData.settings.videoChatURL);
        }
    }, [queueData]);

    const updateVideoChatEnabled = (chatEnabled) => {
        setVideoChatEnabled(chatEnabled);
        SettingsService.updateVideoChatSettings({
            enabled: chatEnabled,
            url: videoChatURL
        });
    };

    const updateVideoChatURL = (event) => {
        event.preventDefault();
        SettingsService.updateVideoChatSettings({
            enabled: isVideoChatEnabled,
            url: videoChatURL
        });
    };

    return (
        <div className='card' style={{ display: 'flex' }}>
            <Card sx={{ minWidth: '100%', mt: 1 }}>
                <CardContent>
                    <Typography sx={{ fontSize: 16, fontWeight: 'bold', ml: 1, mt: 1}} variant="h5" gutterBottom>
                        Video Chat Settings
                    </Typography>
                    <FormGroup>
                        <FormControlLabel 
                            control={
                                <Checkbox 
                                    size="small"
                                    sx={{ ml: 1 }}
                                    checked={isVideoChatEnabled ?? false}
                                    onChange={(e) => {
                                        let chatEnabled = e.target.checked;
                                        updateVideoChatEnabled(chatEnabled);
                                    }}
                                />
                            } 
                            label="Enable video chat"
                        />
                    </FormGroup>
                    <Collapse in={isVideoChatEnabled ?? false}>
                        <form onSubmit={updateVideoChatURL}>
                            <Grid container spacing={2}>
                                <Grid className="d-flex" item sx={{ mt: 1, ml: 1 }} xs={9.5}>
                                    <TextField 
                                        id="video-chat-url"
                                        placeholder="Video Chat URL"
                                        variant="standard" 
                                        fullWidth
                                        value={videoChatURL ?? ""}
                                        onChange={(e) => setVideoChatURL(e.target.value)}
                                    />
                                </Grid>
                                <Grid className="d-flex" item sx={{ mt: 1, mx: 1 }} xs={2}>
                                    <Button variant="contained" type="submit">Save</Button>
                                </Grid>
                            </Grid>
                        </form>
                    </Collapse>
                </CardContent>
            </Card>
        </div>
    );
}