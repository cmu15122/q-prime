
import React from 'react';
import {
    Box, Button, Dialog, DialogContent, Typography, TextField, Grid, 
} from '@mui/material';

import SettingsService from '../../../../services/SettingsService';

export default function AddLocationDialog(props) {
    const { isOpen, onClose, setRoomDictionary } = props

    const [room, setRoom] = React.useState("");

    const handleCreate = () => {
        SettingsService.addLocation(
            JSON.stringify({
                room: room,
            })
        ).then(res => {
            onClose();
            setRoomDictionary(res.data.roomDictionary)
        });
    };

    return (
        <Dialog
            open={isOpen}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
        >
            <DialogContent>
                <Typography sx={{ pb: 2, fontWeight: 'bold', fontSize: '22px', textAlign: 'center' }}>
                    Add New Location
                </Typography>
                <Grid container spacing={3}>
                    <Grid className="d-flex" item xs={12}>
                        <TextField
                            label="Location: Building + Room Name"
                            variant="standard"
                            required
                            fullWidth
                            value={room}
                            onChange={(e) => {
                                setRoom(e.target.value)
                            }}
                        />
                    </Grid>
                </Grid>
                <Box textAlign='center' sx={{pt: 5}}>
                    <Button onClick={handleCreate} variant="contained" sx={{ alignSelf: 'center' }}>Add</Button>
                </Box>
            </DialogContent>
        </Dialog>
    );
}
