import React from "react";
import {
  Typography,
  Divider,
  CardContent,
  Stack,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import PauseIcon from "@mui/icons-material/Pause";
import { styled } from "@mui/material/styles";

import BaseCard from "../../common/cards/BaseCard";

import * as converter from "number-to-words";

const CustomDivider = styled(Divider)({
  marginTop: ".5em",
  marginBottom: ".5em",
});

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

export default function YourEntry(props) {
  const { openRemoveOverlay } = props;

  const queueData = useQuery(api.home.home_get.getQueueData);
  const userData = useQuery(api.home.home_get.getUserData);
  const studentData = userData?.student_data;

  const cooldownMsg = queueData?.allow_cooldown_override
    ? "You have been frozen in line. This means you will not advance in the queue until a TA approves your entry."
    : "You have been frozen in line. You will not advance in the queue! Please wait for your cooldown to end before joining the queue again.";

  const position =
    studentData && queueData
      ? Math.max(
          studentData.position +
            1 -
            (queueData.num_students - queueData.num_unhelped),
          1,
        )
      : 0;

  return (
    <BaseCard>
      <CardContent sx={{ m: 1, textAlign: "left" }}>
        <Stack direction="row" display="flex" alignItems="center">
          <Typography variant="h5" sx={{ fontWeight: "bold", pr: 1 }}>
            Your Entry:
          </Typography>
          <Typography variant="h5">
            You are <strong>{converter.toOrdinal(position)} in line</strong>
          </Typography>
          <IconButton
            color="error"
            sx={{ marginLeft: "auto", marginRight: ".5em" }}
            onClick={openRemoveOverlay}
          >
            <DeleteIcon />
          </IconButton>
        </Stack>
        <Typography variant="h6">
          The estimated time until you are helped is{" "}
          <strong>
            {!queueData ||
            !studentData ||
            queueData.num_tas * studentData.position === 0
              ? 0
              : Math.floor(
                  (queueData.mins_per_student / queueData.num_tas) *
                    studentData.position,
                )}{" "}
            minutes
          </strong>
        </Typography>
        {studentData &&
          (studentData.status === "fixing_question" ||
            studentData.status === "frozen" ||
            studentData.status === "cooldown_violation") && (
            <div>
              <CustomDivider />
              <Stack direction="row" display="flex" alignItems="center">
                <PauseIcon color="error" sx={{ pr: 1 }} />
                <Typography color="error" sx={{ fontWeight: "bold" }}>
                  {cooldownMsg}
                </Typography>
              </Stack>
            </div>
          )}
        <CustomDivider />
        <Typography variant="h6">
          <strong>Location:</strong> {studentData?.location || ""}
        </Typography>
        <Typography variant="h6">
          <strong>Topic:</strong> {studentData?.assignment_name || ""}
        </Typography>
        <CustomDivider />
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          Question:
        </Typography>
        <Typography variant="h6" style={{ whiteSpace: "pre-line" }}>
          {studentData?.question || ""}
        </Typography>
      </CardContent>
    </BaseCard>
  );
}
