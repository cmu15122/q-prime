import React, {useState, useEffect, useContext} from 'react';
import {
  Button, Collapse, FormGroup, FormControlLabel, Checkbox,
  CardContent, Typography, TextField, Grid,
} from '@mui/material';

import BaseCard from '../common/cards/BaseCard';

import SettingsService from '../../services/SettingsService';
import {UserDataContext} from '../../App';

export default function VideoChatSettings(props) {
  const {userData} = useContext(UserDataContext);

  const [isVideoChatEnabled, setVideoChatEnabled] = useState(false);
  const [videoChatURL, setVideoChatURL] = useState('');

  useEffect(() => {
    setVideoChatEnabled(userData.taSettings?.videoChatEnabled);
    setVideoChatURL(userData.taSettings?.videoChatURL);
  }, [userData]);

  const updateVideoChatEnabled = (chatEnabled) => {
    setVideoChatEnabled(chatEnabled);
    SettingsService.updateVideoChatSettings({
      enabled: chatEnabled,
      url: chatEnabled ? videoChatURL : '',
    });
  };

  const updateVideoChatURL = (event) => {
    event.preventDefault();
    SettingsService.updateVideoChatSettings({
      enabled: isVideoChatEnabled,
      url: isVideoChatEnabled ? videoChatURL : '',
    });
  };

  return (
    <BaseCard>
      <CardContent>
        <Typography sx={{fontWeight: 'bold', ml: 1, mt: 1}} variant="body1" gutterBottom>
          Video Chat Settings
        </Typography>
        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                size="small"
                sx={{ml: 1}}
                checked={isVideoChatEnabled ?? false}
                onChange={(e) => {
                  const chatEnabled = e.target.checked;
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
              <Grid className="d-flex" item sx={{mt: 1, ml: 1}} xs={9.5}>
                <TextField
                  id="video-chat-url"
                  placeholder="Video Chat URL"
                  variant="standard"
                  fullWidth
                  value={videoChatURL ?? ''}
                  onChange={(e) => setVideoChatURL(e.target.value)}
                />
              </Grid>
              <Grid className="d-flex" item sx={{mt: 1, mx: 1}} xs={2}>
                <Button variant="contained" type="submit">Save</Button>
              </Grid>
            </Grid>
          </form>
        </Collapse>
      </CardContent>
    </BaseCard>
  );
}
