import React, { useState, useEffect } from 'react';
import {
    Typography, Divider, Card, CardContent, Stack, FormControl, InputLabel,
    MenuItem, Box, Select, Input, Button
} from '@mui/material'

import HomeService from '../../../services/HomeService';
import SettingsService from '../../../services/SettingsService';

function createData(topic_id, name) {
    return { topic_id, name };
}

let date = new Date();

export default function AskQuestion(props) {
    const [locations, setLocations] = useState([])
    const [topics, setTopics] = useState([]);

    const { questionValue, setQuestionValue, queueData, theme } = props

    const [name, setName] = useState('')
    const [id, setID] = useState('')
    const [location, setLocation] = useState('')
    const [topic, setTopic] = useState('')

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
    }

    function updateLocations() {
        let day = date.getDay()
        let newLocations = {}
        SettingsService.getLocations().then(res => {
            let dayDict = res.data.dayDictionary;
            newLocations = dayDict;

            let roomsForDay = (newLocations && newLocations[day]) ? newLocations[day] : [];
            setLocations(roomsForDay);
        })
    }

    function callAddQuestionAPI() {
        HomeService.addQuestion(
            JSON.stringify({
                name: name,
                andrewID: id,
                question: questionValue,
                location: location,
                topic: topic,
                overrideCooldown: true,
            })
        ).then((res) => {
            if (res.status === 200) {
                clearValues();
            }
        });
    }

    function clearValues() {
        setName('');
        setID('');
        setLocation('');
        setTopic('');
        setQuestionValue('');
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        callAddQuestionAPI();
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
                                <FormControl required fullWidth>
                                    <Input
                                        placeholder='Student Name'
                                        onChange={(event) => setName(event.target.value)}
                                        value={name}
                                        fullWidth
                                        inputProps={{ maxLength: 30 }}
                                    />
                                </FormControl>
                            </Box>
                            <Box sx={{ minWidth: 120, width: "47%", margin: "auto", mr: 1 }}>
                                <FormControl required fullWidth>
                                    <Input
                                        placeholder='Student Andrew ID'
                                        onChange={(event) => setID(event.target.value)}
                                        value={id}
                                        fullWidth
                                        inputProps={{ maxLength: 20 }}
                                    />
                                </FormControl>
                            </Box>
                        </Stack>
                        <Stack direction="row" justifyContent="left" sx={{ mt: 2 }}>
                            <Box sx={{ minWidth: 120, width: "47%" }}>
                                <FormControl required fullWidth>
                                    <InputLabel id="location-select">Location</InputLabel>
                                    <Select
                                        labelId="location-select-label"
                                        id="location-select"
                                        value={location}
                                        label="Location"
                                        onChange={(e) => setLocation(e.target.value)}
                                    >
                                        {
                                            locations.length === 0 ?
                                                <MenuItem value="122 Office Hours" key="122 Office Hours">122 Office Hours</MenuItem>
                                                :
                                                locations.map((loc) => <MenuItem value={loc} key={loc}>{loc}</MenuItem>)
                                        }
                                    </Select>
                                </FormControl>
                            </Box>
                            <Box sx={{ minWidth: 120, width: "47%", margin: "auto", mr: 1 }}>
                                <FormControl required fullWidth>
                                    <InputLabel id="topic-select">Topic</InputLabel>
                                    <Select
                                        labelId="topic-select-label"
                                        id="topic-select"
                                        value={topic}
                                        label="Topic"
                                        onChange={(e) => setTopic(e.target.value)}
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
                                value={questionValue}
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
