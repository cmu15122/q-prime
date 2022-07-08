
import React, { useState, useEffect } from 'react';
import {
    Button, Card, CardContent, Typography, TextField, Grid
} from '@mui/material';

import SettingsService from '../../../services/SettingsService';

export default function ConfigSettings(props) {
    const { queueData } = props

    const [ currSem, setCurrSem ] = useState("");
    const [ slackURL, setSlackURL ] = useState("");
    const [ questionsURL, setQuestionsURL ] = useState("");

    useEffect(() => {
        if (queueData != null && queueData.adminSettings != null) {
            setCurrSem(queueData.adminSettings.currSem);
            setSlackURL(queueData.adminSettings.slackURL);
            setQuestionsURL(queueData.adminSettings.questionsURL);
        }
    }, [queueData]);

    const handleUpdateSemester = event => {
        event.preventDefault();
        if (currSem === queueData.adminSettings.currSem) return;

        SettingsService.updateSemester(
            JSON.stringify({
                sem_id: currSem,
            })
        ).then(() => {
            // Reload entire page since we've changed semesters
            window.location.reload();
        });
    };

    const handleUpdateSlackURL = event => {
        event.preventDefault();
        if (slackURL === queueData.adminSettings.slackURL) return;

        SettingsService.updateSlackURL(
            JSON.stringify({
                slackURL: slackURL,
            })
        );
    };

    const handleUpdateQuestionsURL = event => {
        event.preventDefault();
        if (questionsURL === queueData.adminSettings.questionsURL) return;

        SettingsService.updateQuestionsURL(
            JSON.stringify({
                questionsURL: questionsURL,
            })
        );
    };

    return (
        <div className='card' style={{ display:'flex' }}>
            <Card sx={{ minWidth: '100%' }}>
                <CardContent>
                    <Typography sx={{ fontSize: 16, fontWeight: 'bold', ml: 1, mt: 1 }} variant="h5" gutterBottom>
                        Config Settings
                    </Typography>
                    <form onSubmit={handleUpdateSemester}>
                        <Grid container spacing={2} sx={{mb: 2}}>
                            <Grid className="d-flex" item sx={{ mt: 1, ml: 1 }}>
                                Current Semester:
                                <TextField 
                                    id="current-sem" 
                                    variant="standard" 
                                    sx={{ ml: 1, mt: -1 }} 
                                    style={{ width: '60px' }} 
                                    inputProps={{ maxLength: 3 }}
                                    value={currSem ?? ""}
                                    onChange={(e) => {
                                        setCurrSem(e.target.value)
                                    }}
                                />
                            </Grid>
                            <Grid className="d-flex" item sx={{ mr: 2 }}>
                                <Button type="submit" variant="contained">Save</Button>
                            </Grid>
                        </Grid>
                    </form>
                    <form onSubmit={handleUpdateSlackURL}>
                        <Grid container spacing={2} sx={{mb: 2}}>
                            <Grid className="d-flex" item sx={{ mx: 1 }} xs={10}>
                                <TextField 
                                    id="slack-url" 
                                    placeholder="Slack Webhook URL" 
                                    variant="standard" 
                                    fullWidth
                                    value={slackURL ?? ""}
                                    onChange={(e) => {
                                        setSlackURL(e.target.value)
                                    }}
                                />
                            </Grid>
                            <Grid className="d-flex" item sx={{ mr: 2 }} xs={1.5}>
                                <Button type="submit" variant="contained">Save</Button>
                            </Grid>
                        </Grid>
                    </form>
                    <form onSubmit={handleUpdateQuestionsURL}>
                        <Grid container spacing={2}>
                            <Grid className="d-flex" item sx={{ mx: 1, mb: 1 }} xs={10}>
                                <TextField 
                                    id="questions-url" 
                                    placeholder="Questions Guide URL" 
                                    variant="standard" 
                                    fullWidth
                                    value={questionsURL ?? ""}
                                    onChange={(e) => {
                                        setQuestionsURL(e.target.value)
                                    }}
                                />
                            </Grid>
                            <Grid className="d-flex" item sx={{ mr: 2 }} xs={1.5}>
                                <Button type="submit" variant="contained">Save</Button>
                            </Grid>
                        </Grid>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
