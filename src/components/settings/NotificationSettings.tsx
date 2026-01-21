import { useState, useEffect } from 'react';
import {
  CardContent,
  Checkbox,
  FormControlLabel,
  Grid,
  TextField,
  Typography,
} from '@mui/material';

import BaseCard from '../common/cards/BaseCard';

import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';

export default function NotificationSettings() {
  const userData = useQuery(api.home.home_get.getUserData);

  const [joinNotifsEnabled, setJoinNotifsEnabled] = useState(false);
  const [remindNotifsEnabled, setRemindNotifsEnabled] = useState(false);
  const [remindTime, setRemindTime] = useState(15);

  useEffect(() => {
    if (userData) {
      setJoinNotifsEnabled(userData.ta_data!.join_notifs_enabled);
      setRemindNotifsEnabled(userData.ta_data!.remind_notifs_enabled);
      setRemindTime(userData.ta_data!.remind_time_mins);
    }
  }, [userData]);

  const updateNotifSettingsMutation = useMutation(api.settings.settings_mutate.updateNotifications);

  const updateNotifSettings = async (joinEnabled, remindEnabled, time) => {
    await updateNotifSettingsMutation({
      joinEnabled: joinEnabled,
      remindEnabled: remindEnabled,
      remindTime: time,
    });
  };

  return (
    <BaseCard>
      <CardContent>
        <Typography sx={{ fontWeight: 'bold', ml: 1, mt: 1 }} variant="body1" gutterBottom>
          Notification Settings
        </Typography>
        <Grid container spacing={1}>
          <Grid className="d-flex" item sx={{ mb: -1 }} xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  sx={{ ml: 1 }}
                  checked={joinNotifsEnabled ?? false}
                  onChange={(e) => {
                    const isJoinNotifsEnabled = e.target.checked;
                    setJoinNotifsEnabled(isJoinNotifsEnabled);
                    updateNotifSettings(isJoinNotifsEnabled, remindNotifsEnabled, remindTime);
                  }}
                />
              }
              label={<div>Enable queue join notifications</div>}
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
                    const isRemindNotifsEnabled = e.target.checked;
                    setRemindNotifsEnabled(isRemindNotifsEnabled);
                    updateNotifSettings(joinNotifsEnabled, isRemindNotifsEnabled, remindTime);
                  }}
                />
              }
              label={
                <div>
                  Remind me after I&apos;ve been helping for
                  <TextField
                    id="time-notif"
                    disabled={!(remindNotifsEnabled ?? false)}
                    type="number"
                    variant="standard"
                    sx={{ mr: 1, ml: 1, mt: -1 }}
                    style={{ width: '50px' }}
                    inputProps={{ style: { textAlign: 'center' }, min: 0 }}
                    value={remindTime ?? 15}
                    onChange={(e) => {
                      const newRemindTime = parseInt(e.target.value, 10);
                      setRemindTime(newRemindTime);
                      updateNotifSettings(joinNotifsEnabled, remindNotifsEnabled, newRemindTime);
                    }}
                  />
                  minutes
                </div>
              }
            />
          </Grid>
        </Grid>
      </CardContent>
    </BaseCard>
  );
}
