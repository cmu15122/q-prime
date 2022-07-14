import React, { useState } from 'react';
import {Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions} from '@mui/material';

export default function AlertOnLogout(props) {
    const {isOpen, setOpen, handleConfirm} = props;

    const handleClose = () => {
        setOpen(false);
    }

    return <div>
        <Dialog open={isOpen} onClose={() => {setOpen(false);}}>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogContent>
                <DialogContentText>Logging out will remove your place in the queue.</DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button onClick={handleConfirm} autoFocus>Confirm</Button>
            </DialogActions>
        </Dialog>
    </div>;
}
