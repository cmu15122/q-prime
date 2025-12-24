import React from "react";
import {
  Typography,
  Button,
  Dialog,
  DialogContent,
  Divider,
} from "@mui/material";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";

export default function TAHelpingOverlay(props) {
  const { open } = props;

  const userData = useQuery(api.home.home_get.getUserData);
  const studentData = userData?.student_data;

  return (
    <Dialog open={open} maxWidth="sm" fullWidth>
      <DialogContent sx={{ p: 5, textAlign: "center" }}>
        <Typography variant="h6" textAlign="center">
          You are being helped by{" "}
          {studentData?.helping_ta?.preferred_name || ""} (TA)!
        </Typography>
        {studentData?.helping_ta?.preferred_name && (
          <Button
            sx={{ mt: 3 }}
            variant="contained"
            target="_blank"
            href={studentData?.helping_ta?.zoom_url || ""}
          >
            Join Zoom
          </Button>
        )}
        <Divider sx={{ mt: ".5em", mb: ".5em" }} />
        <Typography variant="h6" textAlign="center">
          As a reminder, you asked:
        </Typography>
        <Typography variant="h6" textAlign="center">
          {studentData?.question || ""}
        </Typography>
      </DialogContent>
    </Dialog>
  );
}
