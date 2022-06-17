
import React from 'react';
import {
    Box, Button, Dialog, DialogContent, Typography, TextField, Grid
} from '@mui/material'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { DateTime } from 'luxon';

export default function AddTopicDialog(props) {
    const { isOpen, onClose } = props

    const [name, setName] = React.useState("");
    const [category, setCategory] = React.useState("Written");
    const [startDate, setStartDate] = React.useState(DateTime.now());
    const [endDate, setEndDate] = React.useState(DateTime.now());

    const callAddTopicAPI = async () => {
        const response = await fetch('http://localhost:8000/settings/topics/add', 
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                  },
                body: JSON.stringify({
                    name: name,
                    category: category,
                    start_date: startDate,
                    end_date: endDate
                })
            });
        const body = await response.json();
  
        if (response.status !== 200) {
            throw Error(body.message);
        }

        onClose();
    };

    const updateStartDate = (newStartDate) => {
        setStartDate(newStartDate);
        if (newStartDate > endDate) {
            setEndDate(newStartDate);
        }
    }

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
                            onChange={(newValue) => {
                                setName(newValue);
                            }}
                            fullWidth
                        />
                    </Grid>
                    <Grid className="d-flex" item xs={6}>
                        <DateTimePicker
                            renderInput={(props) => <TextField {...props} variant="standard" required fullWidth />}
                            label="Start Date"
                            onChange={(newValue) => {
                                updateStartDate(newValue);
                            }}
                            value={startDate}
                        />
                    </Grid>
                    <Grid className="d-flex" item xs={6}>
                        <DateTimePicker
                            renderInput={(props) => <TextField {...props} variant="standard" required fullWidth />}
                            label="End Date"
                            onChange={(newValue) => {
                                setEndDate(newValue);
                            }}
                            value={endDate}
                            minDate={startDate}
                        />
                    </Grid>
                </Grid>
                <Box textAlign='center' sx={{pt: 6}}>
                    <Button onClick={callAddTopicAPI} variant="contained" sx={{ alignSelf: 'center' }} >Create</Button>
                </Box>
            </DialogContent>
        </Dialog>
    );
}
