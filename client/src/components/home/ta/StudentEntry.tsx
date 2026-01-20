import React, { useState, useEffect, useRef } from "react";
import { Stack, TableCell, Typography } from "@mui/material";
import PauseIcon from "@mui/icons-material/Pause";

import EntryTails from "./EntryTails";
import ItemRow from "../../common/table/ItemRow";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Doc } from "../../../../../convex/_generated/dataModel";

export default function StudentEntry(props) {
  const queueData = useQuery(api.home.home_get.getQueueData);
  const student: Doc<"ohq"> = props["student"];

  const {
    index,
    handleClickHelp,
    removeStudent,
    handleClickUnfreeze,
    handleFix,
    currentTime,
  } = props;

  const [confirmRemove, setConfirmRemove] = useState(false);
  const removeRef = useRef();

  const [showCooldownApproval, setShowCooldownApproval] = useState(
    queueData?.allow_cooldown_override &&
      student.status === "cooldown_violation",
  );

  useEffect(() => {
    const closeExpanded = (e) => {
      const path = e.path || (e.composedPath && e.composedPath());
      if (!path.includes(removeRef.current)) {
        setConfirmRemove(false);
      }
    };

    document.body.addEventListener("click", closeExpanded);
    return () => {
      document.body.removeEventListener("click", closeExpanded);
    };
  }, []);

  // Update showCooldownApproval when allowCDOverride changes
  useEffect(() => {
    setShowCooldownApproval(
      queueData?.allow_cooldown_override &&
        student.status === "cooldown_violation",
    );
  }, [queueData?.allow_cooldown_override, student.status]);

  function handleRemoveButton() {
    if (confirmRemove) {
      setConfirmRemove(false);
      removeStudent(index, false);
    } else {
      setConfirmRemove(true);
    }
  }

  const approveCooldownOverrideMutation = useMutation(
    api.home.home_mutate.approveCooldownOverride,
  );
  const approveCooldownOverride = async () => {
    await approveCooldownOverrideMutation({
      student_id: student.student_id,
    });
  };
  return (
    <ItemRow index={index} rowKey={student._id}>
      <TableCell
        padding="none"
        component="th"
        scope="row"
        sx={{ py: 2, pl: 3.25, pr: 2, width: "20%" }}
      >
        {student.student_name} ({student.student_email})<br />[
        {student.location}]
      </TableCell>
      <TableCell
        padding="none"
        align="left"
        sx={{ py: 2, pr: 2, width: "55%" }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          {(student.status === "cooldown_violation" ||
            student.status === "fixing_question" ||
            student.status === "frozen") && <PauseIcon fontSize="inherit" />}
          {<Typography variant="body2">[{student.assignment_name}]</Typography>}
          {
            <Typography variant="body2" sx={{ whiteSpace: "pre-line" }}>
              {" "}
              {student.question}{" "}
            </Typography>
          }
        </Stack>
      </TableCell>
      <TableCell padding="none" sx={{ width: "25%" }}>
        {EntryTails({
          ...props,
          removeRef: removeRef,
          confirmRemove: confirmRemove,
          handleRemoveButton: handleRemoveButton,
          removeStudent: removeStudent,
          handleClickHelp: handleClickHelp,
          handleClickUnfreeze: handleClickUnfreeze,
          handleFix: handleFix,
          showCooldownApproval: showCooldownApproval,
          approveCooldownOverride: approveCooldownOverride,
          currentTime: currentTime,
        })}
      </TableCell>
    </ItemRow>
  );
}
