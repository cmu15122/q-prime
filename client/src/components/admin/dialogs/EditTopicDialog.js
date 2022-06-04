
import React from 'react';
import {
    Box, Button, Dialog, DialogContent, Typography, TextField, Grid
} from '@mui/material'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

export default function EditTopicDialog(props) {
    const { isOpen, onClose, topicInfo } = props

    const [dateIn, setDateIn] = React.useState(topicInfo?.dateIn);
    const [dateOut, setDateOut] = React.useState(topicInfo?.dateOut);

    return (
        <Dialog
            open={isOpen}
            onClose={onClose}
        >
            <DialogContent sx={{ py: 4, px: 4 }}>
                <Typography sx={{ pb: 4, fontWeight: 'bold', fontSize: '22px', textAlign: 'center' }}>
                    Edit Topic Info
                </Typography>
                <Grid container spacing={3} >
                    <Grid className="d-flex" item xs={12}>
                        <TextField
                            label="Topic Name"
                            defaultValue={topicInfo?.name}
                            variant="standard"
                            required
                            fullWidth
                        />
                    </Grid>
                    <Grid className="d-flex" item xs={6}>
                        <DateTimePicker
                            renderInput={(props) => <TextField {...props} variant="standard" required fullWidth />}
                            label="Start Date"
                            value={topicInfo?.dateIn}
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
                            value={topicInfo?.dateOut}
                            onChange={(newValue) => {
                                setDateOut(newValue);
                            }}
                            maxDate={dateIn}
                        />
                    </Grid>
                </Grid>
                <Box textAlign='center' sx={{pt: 6}}>
                    <Button onClick={onClose} variant="contained" color="info" sx={{ alignSelf: 'center' }} >Save</Button>
                </Box>
            </DialogContent>
        </Dialog>
    );
}
