import React from "react";
import {
    FormControl, Grid, InputLabel, MenuItem, Select, TextField
} from "@mui/material";

import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";

export default function TopicDialogBody(props) {
    const { 
        name, setName, category, setCategory, 
        startDate, setStartDate, endDate, setEndDate
    } = props;

    return (
        <Grid container spacing={3}>
            <Grid className="d-flex" item xs={6}>
                <TextField
                    label="Topic Name"
                    variant="standard"
                    required
                    fullWidth
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </Grid>
            <Grid className="d-flex" item xs={6}>
                <FormControl variant="standard" fullWidth required>
                    <InputLabel>Category</InputLabel>
                    <Select
                        label="Category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
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
                    onChange={(newValue) => setStartDate(newValue)}
                />
            </Grid>
            <Grid className="d-flex" item xs={6}>
                <DateTimePicker
                    renderInput={(props) => <TextField {...props} variant="standard" required fullWidth />}
                    label="End Date"
                    value={endDate}
                    onChange={(newValue) => setEndDate(newValue)}
                    minDate={startDate}
                />
            </Grid>
        </Grid>
    );
}
