import * as React from 'react';
import {
    Typography,
    Button,
    Dialog,
} from '@mui/material'

export default function RemoveQOverlay(props) {
    const { open, handleClose } = props
    return (
        <Dialog open={open} onClose={handleClose}>
            <Typography variant='h6'>Remove your question from the queue?</Typography>
            <Typography variant='body1'>You will forfeit your position on the queue.</Typography>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={handleClose}>Remove</Button>
        </Dialog>
    );
}
