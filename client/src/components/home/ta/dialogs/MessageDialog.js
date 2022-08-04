import React, { useState } from "react";
import {
    Box, Button, Dialog, DialogContent, Typography, TextField, Grid
} from "@mui/material";

import HomeService from '../../../../services/HomeService';

export default function MessageDialog(props) {
    const { isOpen, onClose, student } = props

    const [message, setMessage] = useState("");

    const onSubmit = event => {
        event.preventDefault();
        HomeService.messageStudent(JSON.stringify({
            andrewID: student.andrewID,
            message: message
        })).then(() => {
            onClose();
        });
    };

    return (
        <Dialog
            open={isOpen}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
        >
            <DialogContent>
                <Typography sx={{ pb: 1, fontWeight: 'bold', fontSize: '22px', textAlign: 'center' }}>
                    Messaging Student "{student.name}"
                </Typography>
                <Typography sx={{ pb: 2, fontSize: '15px', textAlign: 'center', fontStyle: 'italic' }}>
                    {(student.status == 5) && "Note: Student has already been messaged. Sending a message here will overwrite the existing message"}
                </Typography>
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
                    <Box textAlign='center' sx={{ pt: 5 }}>
                        <Button type="submit" variant="contained" sx={{ alignSelf: 'center' }}>Send Message</Button>
                    </Box>
                </form>
            </DialogContent>
        </Dialog>
    );
}
