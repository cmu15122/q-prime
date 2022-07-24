
import React from 'react';
import {
    Box, Button, Dialog, DialogContent, Typography, TextField, Grid, 
    Select, MenuItem, InputLabel, FormControl
} from '@mui/material'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { DateTime } from 'luxon';

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
        >
            <DialogContent>
                <Typography sx={{ pb: 2, fontWeight: 'bold', fontSize: '22px', textAlign: 'center' }}>
                    Add New Location
                </Typography>
                <form onSubmit={handleCreate}>
                    <Grid container spacing={3} >
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
                    <Box textAlign='center' sx={{pt: 6}}>
                        <Button variant="contained" sx={{ alignSelf: 'center' }} type="submit" >Add</Button>
                    </Box>
                </form>
            </DialogContent>
        </Dialog>
    );
}
