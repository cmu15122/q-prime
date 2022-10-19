import React from 'react';
import {Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions} from '@mui/material';

export default function AlertOnLogout(props) {
  const {isOpen, setOpen, handleConfirm} = props;

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <Dialog open={isOpen} onClose={() => {
        setOpen(false);
      }}>
        <DialogTitle>Are you sure?</DialogTitle>
        <DialogContent>
          <DialogContentText> If logged out, you may not get notified when you&apos;re up next.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={handleClose}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleConfirm} autoFocus>Confirm</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
