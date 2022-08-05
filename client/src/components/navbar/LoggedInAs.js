import React, { useState, useEffect } from "react";
import {
    Button, Dialog, DialogActions, DialogTitle, DialogContent, DialogContentText, TextField,
} from "@mui/material";

import SettingsService from "../../services/SettingsService";

export default function LoggedInAs(props) {
    const { queueData } = props;
    
    const [ open, setOpen ] = useState(false);
    const [ pname, setpname ] = useState();
    
    useEffect(() => {
        if (queueData != null) {
            setpname(queueData.preferred_name);
        }
    }, [queueData]);
    
    const handleClickOpen = () => {
        setOpen(true);
    };
    
    const handleClose = () => {
        setOpen(false);
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        SettingsService.updatePreferredName({preferred_name:pname});
        handleClose();
    };
    
    return (
        <div>
            <Button variant="h8" onClick={handleClickOpen} sx={{ color: "#FFFFFF" }}>
                Logged in as {queueData.andrewID}
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
                            value={pname}
                            onChange={(e) => setpname(e.target.value)}
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
                        <Button type="submit">Set new name</Button>
                    </DialogActions>
                </form>
            </Dialog>
        </div>
    );
}
    