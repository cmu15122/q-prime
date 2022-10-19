import React from 'react';
import PropTypes from 'prop-types';
import {
  Box, Button, Dialog, DialogContent, Typography,
} from '@mui/material';

export default function EditDialog(props) {
  const {isOpen, onClose, handleEdit, title, children} = props;

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
        <form onSubmit={handleEdit}>
          {children}
          <Box textAlign='center' sx={{pt: 5}}>
            <Button type="submit" variant="contained" color="info" sx={{alignSelf: 'center'}}>Save</Button>
          </Box>
        </form>
      </DialogContent>
    </Dialog>
  );
}

EditDialog.propTypes = {
  title: PropTypes.string,
  isOpen: PropTypes.bool,
  children: PropTypes.node,
  onClose: PropTypes.func.isRequired,
  handleEdit: PropTypes.func.isRequired,
};
