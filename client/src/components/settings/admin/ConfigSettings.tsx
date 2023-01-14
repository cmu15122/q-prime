
import React, {useState, useEffect, useContext} from 'react';
import {
  Button, CardContent, Typography, TextField, Grid,
} from '@mui/material';

import BaseCard from '../../common/cards/BaseCard';

import SettingsService from '../../../services/SettingsService';
import {QueueSettingsContext} from '../../../contexts/QueueSettingsContext';
import {QueueDataContext} from '../../../contexts/QueueDataContext';

export default function ConfigSettings(props) {
  const {queueSettings} = useContext(QueueSettingsContext);
  const {queueData} = useContext(QueueDataContext);

  const [currSem, setCurrSem] = useState('');
  const [slackURL, setSlackURL] = useState('');
  const [questionsURL, setQuestionsURL] = useState('');

  useEffect(() => {
    setCurrSem(queueSettings.currSem);
    setSlackURL(queueSettings.slackURL);
    setQuestionsURL(queueData.questionsURL);
  }, [queueSettings]);

  const handleUpdateSemester = (event) => {
    event.preventDefault();
    if (currSem === queueSettings.currSem) return;

    SettingsService.updateSemester(
        JSON.stringify({
          sem_id: currSem,
        }),
    ).then(() => {
      // Reload entire page since we've changed semesters
      window.location.reload();
    });
  };

  const handleUpdateSlackURL = (event) => {
    event.preventDefault();
    if (slackURL === queueSettings.slackURL) return;

    SettingsService.updateSlackURL(
        JSON.stringify({
          slackURL: slackURL,
        }),
    );
  };

  const handleUpdateQuestionsURL = (event) => {
    event.preventDefault();
    if (questionsURL === queueData.questionsURL) return;

    SettingsService.updateQuestionsURL(
        JSON.stringify({
          questionsURL: questionsURL,
        }),
    );
  };

  return (
    <BaseCard>
      <CardContent>
        <Typography sx={{fontWeight: 'bold', ml: 1, mt: 1}} variant="body1" gutterBottom>
          Config Settings
        </Typography>
        <form onSubmit={handleUpdateSemester}>
          <Grid container spacing={2} sx={{mb: 2}}>
            <Grid className="d-flex" item sx={{mt: 1, ml: 1}}>
              Current Semester:
              <TextField
                id="current-sem"
                variant="standard"
                sx={{ml: 1, mt: -1}}
                style={{width: '60px'}}
                inputProps={{maxLength: 3}}
                value={currSem ?? ''}
                onChange={(e) => {
                  setCurrSem(e.target.value);
                }}
              />
            </Grid>
            <Grid className="d-flex" item sx={{mr: 2}}>
              <Button type="submit" variant="contained">Save</Button>
            </Grid>
          </Grid>
        </form>
        <form onSubmit={handleUpdateSlackURL}>
          <Grid container spacing={2} sx={{mb: 2}}>
            <Grid className="d-flex" item sx={{mx: 1}} xs={10}>
              <TextField
                id="slack-url"
                placeholder="Slack Webhook URL"
                variant="standard"
                fullWidth
                value={slackURL ?? ''}
                onChange={(e) => {
                  setSlackURL(e.target.value);
                }}
              />
            </Grid>
            <Grid className="d-flex" item sx={{mr: 2}} xs={1.5}>
              <Button type="submit" variant="contained">Save</Button>
            </Grid>
          </Grid>
        </form>
        <form onSubmit={handleUpdateQuestionsURL}>
          <Grid container spacing={2}>
            <Grid className="d-flex" item sx={{mx: 1, mb: 1}} xs={10}>
              <TextField
                id="questions-url"
                placeholder="Questions Guide URL"
                variant="standard"
                fullWidth
                value={questionsURL ?? ''}
                onChange={(e) => {
                  setQuestionsURL(e.target.value);
                }}
              />
            </Grid>
            <Grid className="d-flex" item sx={{mr: 2}} xs={1.5}>
              <Button type="submit" variant="contained">Save</Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </BaseCard>
  );
}
