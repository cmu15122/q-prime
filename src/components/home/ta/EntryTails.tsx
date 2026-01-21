import React from "react";
import { Stack, useTheme } from "@mui/material";

import YouAreHelping from "./TailOptions/YouAreHelping";
import ActionsHelp from "./TailOptions/ActionsHelp";
import ActionsFreeze from "./TailOptions/ActionsFreeze";
import StudentStatus from "./TailOptions/StudentStatus";
import LeapStudentActions from "./TailOptions/LeapStudentActions";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Doc } from "../../../../convex/_generated/dataModel";

export default function EntryTails(props) {
  const { currentTime } = props;
  const student: Doc<"ohq"> = props["student"];

  const userData = useQuery(api.home.home_get.getUserData);

  const showApproval = props.showCooldownApproval;

  const status = student.status;

  const themeHook = useTheme();

  const getCorrectTail = (status) => {
    switch (status) {
      case "being_helped": {
        if (student.helping_ta!.ta_id === userData?.ta_data?.ta_id) {
          return YouAreHelping({ ...props, theme: themeHook });
        } else {
          return ActionsHelp(props);
        }
      }
      case "waiting":
        return ActionsHelp(props);
      case "fixing_question":
        return ActionsHelp(props);
      case "frozen":
        return ActionsFreeze(props);
      case "cooldown_violation":
        if (showApproval) {
          return LeapStudentActions(props);
        } else {
          return ActionsHelp({ ...props, color: "secondary" });
        }
      default:
        return;
    }
  };
  return (
    <Stack
      direction="column"
      alignItems="center"
      justifyContent="center"
      sx={{
        mr: { xs: 1, sm: 2, lg: 3 },
        ml: { xs: 1, sm: 2 },
        my: 1.5,
      }}
    >
      <StudentStatus student={student} currentTime={currentTime} />
      {getCorrectTail(status)}
    </Stack>
  );
}
