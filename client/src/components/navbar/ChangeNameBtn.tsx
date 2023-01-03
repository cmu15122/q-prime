import React, {useState, useEffect, useContext} from 'react';
import {
  Button, Dialog, DialogActions, DialogTitle, DialogContent, DialogContentText, TextField,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

import SettingsService from '../../services/SettingsService';
import {UserDataContext} from '../../contexts/UserDataContext';

export default function ChangeNameBtn(props) {
  const {setpname, pname} = props;
  const {userData} = useContext(UserDataContext);

  const [tmpPrefName, setTmpPrefName] = useState(pname);
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    SettingsService.updatePreferredName({preferred_name: tmpPrefName});
    handleClose();
  };

  return (
    <div>
      <Button variant="text" onClick={handleClickOpen} sx={{color: '#FFFFFF'}}>
        <EditIcon/>
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <form onSubmit={handleSubmit}>
          <DialogTitle>Change Name</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Update the name that is displayed when you are on the queue and the
              name we will call out to help you during office hours. Your
              professor can see this, so please make it appropriate!
            </DialogContentText>
            <TextField
              value={tmpPrefName}
              onChange={(e) => setTmpPrefName(e.target.value)}
              autoFocus
              margin="dense"
              id="name"
              label="Preferred Name"
              type="pname"
              fullWidth
              variant="standard"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" onClick={() => setpname(tmpPrefName)}>Set Nickname</Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
}
