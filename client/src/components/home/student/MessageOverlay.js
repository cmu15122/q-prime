import React from "react";
import {
    Button, Dialog, DialogContent, Stack, TextField, Typography, 
} from "@mui/material"

export default function MessageOverlay(props) {
    const { open, message, handleClose, helpingTAInfo, removeFromQueue, dismissMessage } = props

    const leaveQueue = () => {
        removeFromQueue(); 
        handleClose();
    };

    return (
        <Dialog open={open} maxWidth="sm" fullWidth>
            <DialogContent>
                <Typography variant="h5" sx={{fontWeight: "bold"}}>
                    TA {helpingTAInfo?.taName} sent you a message
                </Typography>

                <TextField
                    sx={{ my: 3 }}
                    multiline
                    fullWidth
                    rows={4}
                    value={message}
                    InputProps={{ readOnly: true }}
                    type="url"
                />

                <Stack direction="row" justifyContent="center" alignItems="center" spacing={5}>
                    <Button variant="contained" color="error" onClick={leaveQueue} sx={{ m: 0.5 }}>
                        This answered my question<br/>(leave queue)
                    </Button>
                    <Button variant="contained" color="info" onClick={dismissMessage} sx={{ m: 0.5 }}>
                        This didn't answer my question<br/>(stay on the queue)
                    </Button>
                </Stack>
            </DialogContent>
        </Dialog>
    );
}
