import React from 'react';
import {
    Box, Button, Dialog, DialogContent, Typography, TextField, Grid, 
    Select, MenuItem, InputLabel, FormControl
} from '@mui/material'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

import SettingsService from '../../../../services/SettingsService';

export default function EditTopicDialog(props) {
    const { isOpen, onClose, topicInfo, updateTopics } = props;

    const [name, setName] = React.useState('');
    const [category, setCategory] = React.useState('');
    const [startDate, setStartDate] = React.useState(topicInfo?.dateIn);
    const [endDate, setEndDate] = React.useState(topicInfo?.dateOut);

    React.useEffect(() => {
        if (topicInfo != null) {
            setName(topicInfo.name);
            setCategory(topicInfo.category);
            setStartDate(topicInfo.dateIn);
            setEndDate(topicInfo.dateOut);
        }
    }, [topicInfo]);

    const handleUpdate = () => {
        SettingsService.updateTopic(
            JSON.stringify({
                assignment_id: topicInfo?.assignment_id,
                name: name,
                category: category,
                start_date: startDate.toString(),
                end_date: endDate.toString()
            })
        ).then(res => {
            updateTopics(res.data.topics);
            onClose();
        });
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
                    Edit Topic Info
                </Typography>
                <Grid container spacing={3} >
                    <Grid className="d-flex" item xs={6}>
                        <TextField
                            label="Topic Name"
                            variant="standard"
                            required
                            fullWidth
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value)
                            }}
                        />
                    </Grid>
                    <Grid className="d-flex" item xs={6}>
                        <FormControl variant="standard" fullWidth required>
                            <InputLabel>Category</InputLabel>
                            <Select
                                label="Category"
                                value={category}
                                onChange={(e) => {
                                    setCategory(e.target.value)
                                }}
                            >
                                <MenuItem value={"Written"}>Written</MenuItem>
                                <MenuItem value={"Programming"}>Programming</MenuItem>
                                <MenuItem value={"Other"}>Other</MenuItem>
                            </Select> 
                        </FormControl>
                    </Grid>
                    <Grid className="d-flex" item xs={6}>
                        <DateTimePicker
                            renderInput={(props) => <TextField {...props} variant="standard" required fullWidth />}
                            label="Start Date"
                            value={startDate}
                            onChange={(newValue) => {
                                updateStartDate(newValue);
                            }}
                        />
                    </Grid>
                    <Grid className="d-flex" item xs={6}>
                        <DateTimePicker
                            renderInput={(props) => <TextField {...props} variant="standard" required fullWidth />}
                            label="End Date"
                            value={endDate}
                            onChange={(newValue) => {
                                setEndDate(newValue);
                            }}
                            minDate={startDate}
                        />
                    </Grid>
                </Grid>
                <Box textAlign='center' sx={{pt: 6}}>
                    <Button onClick={handleUpdate} variant="contained" color="info" sx={{ alignSelf: 'center' }} >Save</Button>
                </Box>
            </DialogContent>
        </Dialog>
    );
}
