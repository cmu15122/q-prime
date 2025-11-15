import React, { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  Typography,
  TextField,
} from "@mui/material";

import { Doc } from "../../../../../../convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";

export default function MessageDialog(props) {
  const { isOpen, onClose } = props;
  const student: Doc<"ohq"> = props["student"];

  const [message, setMessage] = useState("");

  const messageStudentMutation = useMutation(
    api.home.home_mutate.messageStudent,
  );
  const onSubmit = async (event) => {
    event.preventDefault();

    await messageStudentMutation({
      message: message,
      student_id: student.student_id,
    }).then(() => {
      onClose();
    });
  };

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogContent>
        <Typography
          variant="h5"
          sx={{ pb: 1, fontWeight: "bold", textAlign: "center" }}
        >
          Messaging Student &quot;{student.student_name}&quot;
        </Typography>
        {student.messages_from_tas.length > 0 && (
          <Box
            bgcolor="background.paper"
            sx={{
              p: 1,
              mb: 2,
              border: 1,
              borderColor: "grey.400",
              borderRadius: 1,
              display: "flex",
              flexDirection: "column",
              maxHeight: 80,
              overflow: "hidden",
              overflowY: "scroll",
            }}
          >
            <Typography
              variant="body2"
              sx={{ textAlign: "left", fontWeight: "bold" }}
            >
              Previous Messages:
            </Typography>
            {student.messages_from_tas.map((message, index) => (
              <Typography
                key={index}
                variant="body2"
                sx={{ textAlign: "left", fontStyle: "italic" }}
              >
                {message.from_ta_name} : {message.message}
              </Typography>
            ))}
          </Box>
        )}

        <form onSubmit={onSubmit}>
          <TextField
            label="Message"
            required
            multiline
            fullWidth
            rows={4}
            onChange={(event) => setMessage(event.target.value)}
            sx={{ my: 1 }}
          />
          <Box textAlign="center" sx={{ pt: 5 }}>
            <Button
              type="submit"
              variant="contained"
              sx={{ alignSelf: "center" }}
            >
              Send Message
            </Button>
          </Box>
        </form>
      </DialogContent>
    </Dialog>
  );
}
