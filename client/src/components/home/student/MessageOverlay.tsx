import React from "react";
import {
  Button,
  Dialog,
  DialogContent,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";

export default function MessageOverlay(props) {
  const {
    open,
    handleClose,
    messagingTAName,
    removeFromQueue,
    dismissMessage,
  } = props;
  const leaveQueue = () => {
    removeFromQueue();
    handleClose();
  };

  const userData = useQuery(api.home.home_get.getUserData);
  const studentData = userData?.student_data;

  return (
    <Dialog open={open} maxWidth="sm" fullWidth>
      <DialogContent>
        <Typography variant="h5" sx={{ fontWeight: "bold" }}>
          TA {messagingTAName} sent you a message
        </Typography>

        <TextField
          sx={{ my: 3 }}
          multiline
          fullWidth
          rows={4}
          value={
            studentData?.messages_from_tas[
              studentData.messages_from_tas.length - 1
            ] || ""
          }
          InputProps={{ readOnly: true }}
        />

        <Stack
          direction="row"
          justifyContent="center"
          alignItems="center"
          spacing={5}
        >
          <Button
            variant="contained"
            color="error"
            onClick={leaveQueue}
            sx={{ m: 0.5 }}
          >
            This answered my question
            <br />
            (leave queue)
          </Button>
          <Button
            variant="contained"
            color="info"
            onClick={dismissMessage}
            sx={{ m: 0.5 }}
          >
            This didn&apos;t answer my question
            <br />
            (stay on the queue)
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
