import React from "react";
import {
  Typography,
  Button,
  Dialog,
  DialogContent,
  Stack,
  useTheme,
} from "@mui/material";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";

export default function CooldownViolationOverlay(props) {
  const { open, setOpen, email, question, location, assignmentId, timePassed } =
    props;
  const theme = useTheme();

  const queueData = useQuery(api.home.home_get.getQueueData);

  const addQuestionMutation = useMutation(api.home.home_mutate.addQuestion);
  async function callAddQuestionAPIOverrideCooldown() {
    if (queueData?.allow_cooldown_override) {
      await addQuestionMutation({
        question: question,
        location: location,
        assignment_id: assignmentId,
        override_cooldown: true,
        email: email,
      }).finally(() => {
        setOpen(false);
      });
    }
  }

  if (queueData && queueData.allow_cooldown_override) {
    const rejoin_time_mins = queueData.rejoin_time_ms / 1000 / 60;
    return (
      <Dialog open={open} maxWidth="sm" fullWidth>
        <DialogContent sx={{ p: 5, textAlign: "center" }}>
          <Typography variant="h6" textAlign="center">
            You rejoined the queue too quickly! Please wait for{" "}
            {rejoin_time_mins} minutes after finishing your last question, which
            will be in {rejoin_time_mins - timePassed} minutes.
          </Typography>

          <Stack
            alignItems="baseline"
            justifyContent="space-around"
            direction="row"
            spacing={3}
          >
            <Button
              onClick={() => callAddQuestionAPIOverrideCooldown()}
              color="error"
              fullWidth
              variant="contained"
              sx={{ maxHeight: "50px", mt: 3, alignContent: "center" }}
              type="submit"
            >
              Override Cooldown
            </Button>
            <Button
              onClick={() => setOpen(false)}
              style={{ background: theme.alternateColors.cancel }}
              fullWidth
              variant="contained"
              sx={{ maxHeight: "50px", mt: 3, alignContent: "center" }}
              type="submit"
            >
              Close
            </Button>
          </Stack>

          <Typography
            lineHeight={1.3}
            variant="subtitle1"
            textAlign="center"
            sx={{ mt: 3 }}
          >
            Overriding the cooldown will add you to the queue, however you will
            be frozen until a TA approves you.
          </Typography>
        </DialogContent>
      </Dialog>
    );
  } else if (queueData) {
    const rejoin_time_mins = queueData.rejoin_time_ms / 1000 / 60;

    return (
      <Dialog open={open} maxWidth="sm" fullWidth>
        <DialogContent sx={{ p: 5, textAlign: "center" }}>
          <Typography variant="h6" textAlign="center">
            You rejoined the queue too quickly! Please wait for{" "}
            {rejoin_time_mins} minutes after finishing your last question, which
            will be in {rejoin_time_mins - timePassed} minutes.
          </Typography>
          <Button
            onClick={() => setOpen(false)}
            style={{ background: theme.alternateColors.cancel }}
            fullWidth
            variant="contained"
            sx={{ maxHeight: "50px", mt: 3, alignContent: "center" }}
            type="submit"
          >
            Close
          </Button>
        </DialogContent>
      </Dialog>
    );
  } else {
    return <></>;
  }
}
