import * as React from 'react';
import {
    Typography,
    Button,
    Dialog,
} from '@mui/material'

export default function FrozenOverlay(props) {
    const { open, handleClose } = props
    return (
        <Dialog open={open} onClose={handleClose}>
            <Typography variant='h6'>You are frozen as 11th in line.</Typography>
            <Typography variant='body1'>TAs won't call on you while you're frozen.</Typography>
            <Button onClick={handleClose}>Unfreeze</Button>
        </Dialog>
    );
}
