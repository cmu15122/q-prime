import * as React from 'react';
import {
    Typography,
    Button,
    Dialog,
} from '@mui/material'

export default function TAHelpingOverlay(props) {
    const { open, handleClose } = props
    return (
        <Dialog open={open} onClose={handleClose}>
            <Typography variant='h6'>You are being helped by XXXX XXX (TA)!</Typography>
            <Button onClick={handleClose}>Join Zoom</Button>
        </Dialog>
    );
}
