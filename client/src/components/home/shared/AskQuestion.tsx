import React, {useState, useEffect} from 'react';
import {
  Typography, Divider, CardContent, CardActions, Stack,
  FormControl, InputLabel, MenuItem, Box, Select, Input, Button,
} from '@mui/material';

import CooldownViolationOverlay from './CooldownViolationOverlay';
import BaseCard from '../../common/cards/BaseCard';

import HomeService from '../../../services/HomeService';
import SettingsService from '../../../services/SettingsService';
import {useQueueDataContext, useStudentDataContext} from '../../../App';

function createData(assignment_id, name) {
  return {assignment_id, name};
}

const date = new Date();

export default function AskQuestion() {
  const {queueData} = useQueueDataContext();

  const [locations, setLocations] = useState([]);
  const [topics, setTopics] = useState([]);

  // not changing name or andrewID to use global because this component can also be used by TAs to manually add questions
  const [name, setName] = useState('');
  const [andrewID, setAndrewID] = useState('');
  const [location, setLocation] = useState('');
  const [topic, setTopic] = useState(null);
  const [question, setQuestion] = useState('');

  const [showCooldownOverlay, setShowCooldownOverlay] = useState(false);
  const [timePassed, setTimePassed] = useState(0);

  const [askDisabled, setAskDisabled] = useState(false);

  const {studentData, setStudentData} = useStudentDataContext();

  useEffect(() => {
    if (queueData != null) {
      updateTopics(queueData.topics);
      updateLocations();

      if (!queueData.isTA) {
        setName(queueData.preferred_name);
        setAndrewID(queueData.andrewID);
      }
    }
  }, [queueData.topics, queueData.isTA, queueData.andrewID]);

  function updateTopics(newTopics) {
    const newRows = [];
    newTopics.forEach((topic) => {
      newRows.push(topic);
    });
    newRows.push(createData(-1, 'Other'));
    console.log(newRows);
    setTopics(newRows);

    if (newRows.length === 1) {
      setTopic(newRows[0]);
    }
  }

  function updateLocations() {
    const day = date.getDay();
    let newLocations = {};
    SettingsService.getLocations().then((res) => {
      const dayDict = res.data.dayDictionary;
      newLocations = dayDict;

      const roomsForDay = (newLocations && newLocations[day]) ? newLocations[day] : ['Office Hours'];
      setLocations(roomsForDay);

      if (roomsForDay.length === 1) {
        setLocation(roomsForDay[0]);
      }
    });
  }

  function handleSubmit(event) {
    event.preventDefault();
    setAskDisabled(true);
    callAddQuestionAPI();
  }

  function callAddQuestionAPI() {
    HomeService.addQuestion(
        JSON.stringify({
          name: name,
          andrewID: andrewID,
          question: question,
          location: location,
          topic: topic,
        }),
    ).then((res) => {
      if (res.status === 200 && res.data.message === 'cooldown_violation') {
        setTimePassed(Math.round(res.data.timePassed));
        setShowCooldownOverlay(true);
      } else if (res.status === 200) {
        setStudentData({
          ...studentData,
          location: location,
          topic: topic,
          question: question,
        });
        clearValues();
      }

      setAskDisabled(false);
    });
  }

  function clearValues() {
    setName('');
    setAndrewID('');
    setLocation('');
    setTopic(null);
    setQuestion('');
  }

  return (
    <div>
      <BaseCard>
        <CardActions style={{justifyContent: 'space-between'}}>
          <Typography variant='h5' sx={{fontWeight: 'bold', ml: 2, my: 1}}>Ask A Question</Typography>
        </CardActions>
        <Divider></Divider>

        <CardContent sx={{mx: 1.5}}>
          <form onSubmit={handleSubmit}>
            {
              queueData?.isTA &&
                <Stack direction='row' justifyContent='left' sx={{mb: 2}}>
                  <Box sx={{minWidth: 120, width: '47%'}}>
                    <FormControl required fullWidth>
                      <Input
                        placeholder='Student Name'
                        onChange={(event) => setName(event.target.value)}
                        value={name}
                        fullWidth
                        inputProps={{maxLength: 30}}
                      />
                    </FormControl>
                  </Box>
                  <Box sx={{minWidth: 120, width: '47%', margin: 'auto', mr: 1}}>
                    <FormControl required fullWidth>
                      <Input
                        placeholder='Student Andrew ID'
                        onChange={(event) => setAndrewID(event.target.value)}
                        value={andrewID}
                        fullWidth
                        inputProps={{maxLength: 20}}
                      />
                    </FormControl>
                  </Box>
                </Stack>
            }
            <Stack direction='row' justifyContent='left'>
              <Box sx={{minWidth: 120, width: '47%'}}>
                <FormControl variant='standard' required fullWidth>
                  <InputLabel id='location-select'>Location</InputLabel>
                  <Select
                    labelId='location-select-label'
                    id='location-select'
                    value={location ?? ''}
                    label='Location'
                    onChange={(e)=>setLocation(e.target.value)}
                    style={{textAlign: 'left'}}
                  >
                    {locations.map((loc) => <MenuItem value={loc} key={loc}>{loc}</MenuItem>)}
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{minWidth: 120, width: '47%', margin: 'auto', mr: 1}}>
                <FormControl variant='standard' required fullWidth>
                  <InputLabel id='topic-select'>Topic</InputLabel>
                  <Select
                    labelId='topic-select-label'
                    id='topic-select'
                    value={topic ?? ''}
                    label='Topic'
                    onChange={(e)=>setTopic(e.target.value)}
                    style={{textAlign: 'left'}}
                  >
                    {/* // TODO COME BACK FIGURE OUT WHY KEYS AREN'T UNIQUE */}
                    {topics.map((top) => <MenuItem value={top} key={top.assignment_id}>{top.name}</MenuItem>)}
                  </Select>
                </FormControl>
              </Box>
            </Stack>
            <Typography variant='h6' sx={{fontWeight: 'bold', textAlign: 'left', mt: 2}}>Question:</Typography>
            <FormControl required fullWidth sx={{mt: 0.5}}>
              <Input
                placeholder='Question (max 256 characters)'
                onChange={(event) => setQuestion(event.target.value)}
                value={question ?? ''}
                fullWidth
                multiline
                inputProps={{maxLength: 256}}
                type='text'
              />
            </FormControl>
            <Button disabled={askDisabled} fullWidth variant='contained' sx={{mt: 3, py: 1, fontSize: '16px', fontWeight: 'bold', alignContent: 'center'}} type='submit'>
              Ask
            </Button>
          </form>
        </CardContent>
      </BaseCard>

      {/* TODO: Come back and fix this overlay by removing props, also figure out why everything broken lolol */}
      <CooldownViolationOverlay
        open={showCooldownOverlay}
        setOpen={setShowCooldownOverlay}
        timePassed={timePassed}
        andrewID={andrewID}
        question={question}
        location={location}
        topic={topic}
      />
    </div>
  );
}
