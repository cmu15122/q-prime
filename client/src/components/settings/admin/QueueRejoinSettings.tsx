import React, { useEffect, useState } from "react";
import {
  Button,
  CardContent,
  Typography,
  TextField,
  Grid,
} from "@mui/material";

import BaseCard from "../../common/cards/BaseCard";

import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";

export default function QueueRejoinSettings() {
  const queueData = useQuery(api.home.home_get.getQueueData);

  const [rejoinTime, setRejoinTime] = useState(15);

  useEffect(() => {
    if (queueData) {
      setRejoinTime(Math.round(queueData.rejoin_time_ms / 1000 / 60));
    }
  }, [queueData]);

  const updateRejoinTimeMutation = useMutation(
    api.settings.settings_mutate.updateRejoinTime,
  );
  const onSubmit = async (event) => {
    event.preventDefault();
    await updateRejoinTimeMutation({
      rejoinTime: rejoinTime,
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
          Queue Rejoin Settings
        </Typography>
        <form onSubmit={onSubmit}>
          <Grid container spacing={1}>
            <Grid className="d-flex" item sx={{ mt: 1, ml: 1 }}>
              Allow students to rejoin the queue after
              <TextField
                id="current-sem"
                type="number"
                variant="standard"
                sx={{ mx: 1, mt: -1 }}
                style={{ width: "50px" }}
                value={rejoinTime}
                onChange={(e) => {
                  setRejoinTime(parseInt(e.target.value, 10));
                }}
                inputProps={{ min: 0, style: { textAlign: "center" } }}
              />
              minute(s)
            </Grid>
            <Grid className="d-flex" item sx={{ mx: 1 }}>
              <Button type="submit" variant="contained">
                Save
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </BaseCard>
  );
}
