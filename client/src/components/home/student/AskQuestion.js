import React, { useState, useEffect } from 'react';
import {
    Typography, Divider, Card, CardContent, Stack,
    FormControl, InputLabel, MenuItem, Box, Select, Input, Button
} from '@mui/material';

import HomeService from '../../../services/HomeService';
import SettingsService from '../../../services/SettingsService';

function createData(topic_id, name) {
    return { topic_id, name };
}

let date = new Date();

export default function AskQuestion(props) {
    const [locations, setLocations] = useState([])
    const [topics, setTopics] = useState([]);

    const [selectedTopic, setSelectedTopic] = useState();

    const { 
        questionValue, 
        setQuestionValue, 
        locationValue,
        setLocationValue,
        setTopicValue,
        setPosition, 
        setStatus,
        setTimePassed,
        setShowCooldownOverlay,
        queueData,
        theme
    } = props


    useEffect(() => {
        if (queueData != null) {
            updateTopics(queueData.topics);
            updateLocations()
        }
    }, [queueData]);

    function updateTopics(newTopics) {
        let newRows = [];
        newTopics.forEach(topic => {
            newRows.push(createData(
                topic.assignment_id,
                topic.name,
            ));
        });
        newRows.push(createData(-1, "Other"));
        setTopics(newRows);

        if (newRows.length === 1) {
            setSelectedTopic(newRows[0]);
        }
    }

    function updateLocations() {
        let day = date.getDay()
        let newLocations = {}
        SettingsService.getLocations().then(res => {
            let dayDict = res.data.dayDictionary;
            newLocations = dayDict;

            let roomsForDay = (newLocations && newLocations[day]) ? newLocations[day] : ["122 Office Hours"];
            setLocations(roomsForDay);

            if (roomsForDay.length === 1) {
                setLocationValue(roomsForDay[0]);
            }
        })
    }

    function handleSubmit(event) {
        event.preventDefault();
        callAddQuestionAPI()
    }

    function callAddQuestionAPI() {
        setTopicValue(selectedTopic);

        HomeService.addQuestion(
            JSON.stringify({
                question: questionValue,
                location: locationValue,
                topic: selectedTopic,
                andrewID: queueData.andrewID,
                overrideCooldown: false
            })
        ).then(res => {
            if (res.status === 200 && res.data.message === "cooldown_violation") {
                setTimePassed(Math.round(res.data.timePassed));
                setShowCooldownOverlay(true);
            }
            else if (res.status === 200) {
                setPosition(res.data.position);
                setStatus(res.data.status);
            }
        })
    }

    return (
        <div className='card' style={{ display: 'flex' }}>
            <Card sx={{ minWidth: '100%', background: theme.palette.background.paper }}>
                <CardContent sx={{ m: 1.5 }}>
                    <Typography variant='h5' sx={{ fontWeight: 'bold', textAlign: 'left' }}>Ask A Question</Typography>
                    <Divider sx={{ mt: 1, mb: 2 }} />

                    <form onSubmit={handleSubmit}>
                        <Stack direction="row" justifyContent="left">
                            <Box sx={{ minWidth: 120, width: "47%" }}>
                                <FormControl variant="standard" required fullWidth>
                                    <InputLabel id="location-select">Location</InputLabel>
                                    <Select
                                        labelId="location-select-label"
                                        id="location-select"
                                        value={locationValue ?? ""}
                                        label="Location"
                                        onChange={(e)=>setLocationValue(e.target.value)}
                                        style={{textAlign: "left"}}
                                    >
                                        {locations.map((loc) => <MenuItem value={loc} key={loc}>{loc}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </Box>
                            <Box sx={{ minWidth: 120, width: "47%", margin: "auto", mr: 1 }}>
                                <FormControl variant="standard" required fullWidth>
                                    <InputLabel id="topic-select">Topic</InputLabel>
                                    <Select
                                        labelId="topic-select-label"
                                        id="topic-select"
                                        value={selectedTopic ?? ""}
                                        label="Topic"
                                        onChange={(e)=>setSelectedTopic(e.target.value)}
                                        style={{ textAlign: "left" }}
                                    >
                                        {topics.map((top) => <MenuItem value={top} key={top.topic_id}>{top.name}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </Box>
                        </Stack>
                        <Typography variant='h6' sx={{ fontWeight: 'bold', textAlign: 'left', mt: 2 }}>Question:</Typography>
                        <FormControl required fullWidth sx={{ mt: 0.5 }}>
                            <Input
                                placeholder='Question (max 256 characters)'
                                onChange={(event) => setQuestionValue(event.target.value)}
                                fullWidth
                                multiline
                                inputProps={{ maxLength: 256 }}
                                type="text"
                            />
                        </FormControl>
                        <Button fullWidth variant="contained" sx={{ fontSize: "16px", mt: 3, alignContent: "center" }} type="submit">
                            Ask
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
