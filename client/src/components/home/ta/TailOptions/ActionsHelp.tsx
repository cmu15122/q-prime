import React from "react";
import { Button, Stack } from "@mui/material";

import PersistentOptions from "./PersistentOptions";
import { Doc } from "../../../../../../convex/_generated/dataModel";

export default function ActionsHelp(props) {
  const { index, isHelping, handleClickHelp, tempDisabled } = props;
  const student: Doc<"ohq"> = props["student"];

  const buttonColor = props.color == null ? "info" : props.color;

  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      sx={{ alignItems: "center", justifyContent: "flex-end" }}
    >
      <Button
        disabled={
          student.status === "being_helped" || isHelping || tempDisabled
        }
        color={buttonColor}
        variant="contained"
        onClick={() => {
          handleClickHelp(index);
        }}
        sx={{ m: 0.5 }}
      >
        Help
      </Button>
      {PersistentOptions(props)}
    </Stack>
  );
}
