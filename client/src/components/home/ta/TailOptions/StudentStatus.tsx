import React from "react";
import { Typography, useTheme } from "@mui/material";

import { useQuery } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Doc } from "../../../../../../convex/_generated/dataModel";

export default function StudentStatus(props) {
  const { currentTime } = props;
  const student: Doc<"ohq"> = props["student"];

  const userData = useQuery(api.home.home_get.getUserData);
  const queueData = useQuery(api.home.home_get.getQueueData);

  const theme = useTheme();

  const status = student.status;

  const formatTime = (seconds) => {
    // Handle negative or zero seconds
    if (seconds <= 0) return "0:00";

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  // Calculate elapsed time based on the provided currentTime
  const getElapsedTime = () => {
    if (status === "being_helped" && student.help_start_time_ms) {
      const startTime = new Date(student.help_start_time_ms!).getTime();
      return Math.floor((currentTime - startTime) / 1000);
    }
    return 0;
  };

  const chooseText = (status) => {
    if (!userData || !queueData) return "";

    switch (status) {
      case "being_helped": {
        if (student.helping_ta!.ta_id === userData.ta_data!.ta_id) {
          // Show self timer if enabled
          if (userData.ta_data!.show_self_timer && student.help_start_time_ms) {
            return `You have been helping for ${formatTime(getElapsedTime())}`;
          }
          return "You are helping";
        } else {
          // Show others timer if enabled (both user setting and admin setting)
          if (
            userData.ta_data!.show_others_timer &&
            queueData.allow_tas_show_others_timer &&
            student.help_start_time_ms
          ) {
            return `${student?.helping_ta!.preferred_name} has been helping for ${formatTime(getElapsedTime())}`;
          }
          return `${student?.helping_ta!.preferred_name} is Helping`;
        }
      }
      case "fixing_question":
        return "Updating Question";
      case "frozen":
        return "Frozen";
      case "cooldown_violation":
        return "Joined Before Cooldown";
      default:
        return "";
    }
  };

  return (
    <Typography
      fontSize="13px"
      color={theme.palette.success.main}
      style={{ overflowWrap: "break-word" }}
      sx={{ mb: { xs: 1, sm: 0.5 } }}
    >
      {chooseText(status)}
    </Typography>
  );
}
