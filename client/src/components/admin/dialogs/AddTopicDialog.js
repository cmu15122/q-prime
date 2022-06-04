
import React from 'react';
import {
    Box, Button, Dialog, DialogContent, Typography, TextField, Grid
} from '@mui/material'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { DateTime } from 'luxon';

export default function AddTopicDialog(props) {
    const { isOpen, onClose } = props

    const [dateIn, setDateIn] = React.useState(DateTime.now());
    const [dateOut, setDateOut] = React.useState(DateTime.now());

    return (
        <Dialog
            open={isOpen}
            onClose={onClose}
        >
            <DialogContent>
                <Typography sx={{ pb: 2, fontWeight: 'bold', fontSize: '22px', textAlign: 'center' }}>
                    Add New Topic
                </Typography>
                <Grid container spacing={3} >
                    <Grid className="d-flex" item xs={12}>
                        <TextField
                            label="Topic Name"
                            variant="standard"
                            required
                            fullWidth
                        />
                    </Grid>
                    <Grid className="d-flex" item xs={6}>
                        <DateTimePicker
                            renderInput={(props) => <TextField {...props} variant="standard" required fullWidth />}
                            label="Start Date"
                            onChange={(newValue) => {
                                setDateIn(newValue);
                            }}
                            maxDate={dateOut}
                        />
                    </Grid>
                    <Grid className="d-flex" item xs={6}>
                        <DateTimePicker
                            renderInput={(props) => <TextField {...props} variant="standard" required fullWidth />}
                            label="End Date"
                            onChange={(newValue) => {
                                setDateOut(newValue);
                            }}
                            maxDate={dateIn}
                        />
                    </Grid>
                </Grid>
                <Box textAlign='center' sx={{pt: 6}}>
                    <Button onClick={onClose} variant="contained" sx={{ alignSelf: 'center' }} >Create</Button>
                </Box>
            </DialogContent>
        </Dialog>
    );
}
