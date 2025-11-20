import React, { useState } from "react";
import {
  Button,
  Collapse,
  FormGroup,
  FormControlLabel,
  Checkbox,
  CardContent,
  Typography,
  TextField,
  Grid,
} from "@mui/material";

import BaseCard from "../common/cards/BaseCard";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";

export default function VideoChatSettings() {
  const userData = useQuery(api.home.home_get.getUserData);
  const videoChatEnabled = userData?.ta_data?.zoom_enabled ?? false;

  const [videoChatURL, setVideoChatURL] = useState("");

  const updateVideoChatMutation = useMutation(
    api.settings.settings_mutate.updateVideoChat,
  );
  const updateVideoChatEnabled = async (chatEnabled) => {
    await updateVideoChatMutation({
      enabled: chatEnabled,
      url: userData!.ta_data!.zoom_url ?? "",
    });
  };

  const updateVideoChatURL = async (event) => {
    event.preventDefault();

    await updateVideoChatMutation({
      enabled: videoChatEnabled,
      url: videoChatURL,
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
          Video Chat Settings
        </Typography>
        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                size="small"
                sx={{ ml: 1 }}
                checked={videoChatEnabled ?? false}
                onChange={(e) => {
                  const chatEnabled = e.target.checked;
                  updateVideoChatEnabled(chatEnabled);
                }}
              />
            }
            label="Enable video chat"
          />
        </FormGroup>
        <Collapse in={videoChatEnabled ?? false}>
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
                  type="url"
                />
              </Grid>
              <Grid className="d-flex" item sx={{ mt: 1, mx: 1 }} xs={2}>
                <Button variant="contained" type="submit">
                  Save
                </Button>
              </Grid>
            </Grid>
          </form>
        </Collapse>
      </CardContent>
    </BaseCard>
  );
}
