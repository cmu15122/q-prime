import React, { useState, useEffect, useContext } from 'react';
import {
  CardContent,
  Checkbox,
  FormControlLabel,
  Grid,
  Typography,
} from '@mui/material';

import BaseCard from '../common/cards/BaseCard';

import SettingsService from '../../services/SettingsService';
import { UserDataContext } from '../../contexts/UserDataContext';
import { QueueDataContext } from '../../contexts/QueueDataContext';

export default function TimerSettings(props) {
  const { userData } = useContext(UserDataContext);
  const { queueData } = useContext(QueueDataContext);

  const [showSelfTimer, setShowSelfTimer] = useState(false);
  const [showOthersTimer, setShowOthersTimer] = useState(false);

  useEffect(() => {
    setShowSelfTimer(userData.taSettings?.showSelfTimer || false);
    setShowOthersTimer(userData.taSettings?.showOthersTimer || false);
  }, [userData]);

  const updateTimerSettings = (selfTimer, othersTimer) => {
    SettingsService.updateTimerSettings({
      showSelfTimer: selfTimer,
      showOthersTimer: othersTimer,
    });
  };

  return (
    <BaseCard>
      <CardContent>
        <Typography
          sx={{ fontWeight: 'bold', ml: 1, mt: 1 }}
          variant="body1"
          gutterBottom
        >
          Timer Settings
        </Typography>
        <Grid container spacing={1}>
          <Grid className="d-flex" item sx={{ mb: -1 }} xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  sx={{ ml: 1 }}
                  checked={showSelfTimer ?? false}
                  onChange={(e) => {
                    const isShowSelfTimer = e.target.checked;
                    setShowSelfTimer(isShowSelfTimer);
                    updateTimerSettings(isShowSelfTimer, showOthersTimer);
                  }}
                />
              }
              label={<div>Show timer when I&apos;m helping a student</div>}
            />
          </Grid>
          {queueData.allowShowOthersTimer && (
            <Grid className="d-flex" item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    sx={{ ml: 1 }}
                    checked={showOthersTimer ?? false}
                    disabled={!queueData.allowShowOthersTimer}
                    onChange={(e) => {
                      const isShowOthersTimer = e.target.checked;
                      setShowOthersTimer(isShowOthersTimer);
                      updateTimerSettings(showSelfTimer, isShowOthersTimer);
                    }}
                  />
                }
                label={
                  <div>Show timers when other TAs are helping students</div>
                }
              />
            </Grid>
          )}
        </Grid>
      </CardContent>
    </BaseCard>
  );
}
