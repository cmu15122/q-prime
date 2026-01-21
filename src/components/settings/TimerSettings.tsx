import React, { useState, useEffect } from "react";
import {
  CardContent,
  Checkbox,
  FormControlLabel,
  Grid,
  Typography,
} from "@mui/material";

import BaseCard from "../common/cards/BaseCard";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

export default function TimerSettings() {
  const queueData = useQuery(api.home.home_get.getQueueData);
  const userData = useQuery(api.home.home_get.getUserData);

  const [showSelfTimer, setShowSelfTimer] = useState(false);
  const [showOthersTimer, setShowOthersTimer] = useState(false);

  useEffect(() => {
    if (userData) {
      setShowSelfTimer(userData.ta_data!.show_self_timer);
      setShowOthersTimer(userData.ta_data!.show_others_timer);
    }
  }, [userData]);

  const updateTimerSettingsMutation = useMutation(
    api.settings.settings_mutate.updateTimerSettings,
  );
  const updateTimerSettings = async (selfTimer, othersTimer) => {
    await updateTimerSettingsMutation({
      showSelfTimer: selfTimer,
      showOthersTimer: othersTimer,
    });
  };

  return (
    <BaseCard>
      <CardContent>
        <Typography
          sx={{ fontWeight: "bold", ml: 1, mt: 1 }}
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
                  checked={showSelfTimer}
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
          {queueData && queueData.allow_tas_show_others_timer && (
            <Grid className="d-flex" item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    sx={{ ml: 1 }}
                    checked={showOthersTimer}
                    disabled={!queueData.allow_tas_show_others_timer}
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
