import React from 'react';
import PropTypes from 'prop-types';
import {
  Box, Button, Dialog, DialogContent, Typography,
} from '@mui/material';

export default function AddDialog(props) {
  const {isOpen, onClose, handleCreate, title, children} = props;

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogContent>
        <Typography variant="h5" sx={{pb: 2, fontWeight: 'bold', textAlign: 'center'}}>
          {title}
        </Typography>
        <form onSubmit={handleCreate}>
          {children}
          <Box textAlign='center' sx={{pt: 5}}>
            <Button type="submit" variant="contained" sx={{alignSelf: 'center'}}>Add</Button>
          </Box>
        </form>
      </DialogContent>
    </Dialog>
  );
}

AddDialog.propTypes = {
  title: PropTypes.string,
  isOpen: PropTypes.bool,
  children: PropTypes.node,
  onClose: PropTypes.func.isRequired,
  handleCreate: PropTypes.func.isRequired,
};
