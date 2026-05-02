import { useState, useEffect } from 'react';
import {
  Typography,
  Divider,
  CardContent,
  CardActions,
  Stack,
  FormControl,
  InputLabel,
  MenuItem,
  Box,
  Select,
  Input,
  Button,
} from '@mui/material';

import CooldownViolationOverlay from './CooldownViolationOverlay';
import BaseCard from '../../common/cards/BaseCard';

import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { Id } from '../../../../convex/_generated/dataModel';
import { useCourseId } from '../../../contexts/CourseContext';

export default function AskQuestion() {
  const courseId = useCourseId();
  const queueData = useQuery(api.home.home_get.getQueueData, { courseId });
  const userData = useQuery(api.home.home_get.getUserData, { courseId });

  const currAssignments = queueData?.current_assignments || [];

  // not changing name or email to use global because this component can also be used by TAs to manually add questions
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');
  const [assignmentId, setAssignmentId] = useState<Id<'assignments'> | null>(null);
  const [question, setQuestion] = useState('');

  const [showCooldownOverlay, setShowCooldownOverlay] = useState(false);
  const [timePassed, setTimePassed] = useState(0);

  const [askDisabled, setAskDisabled] = useState(false);

  const [locations, setLocations] = useState<string[]>([]);

  useEffect(() => {
    if (queueData) {
      let new_locations = queueData.current_locations;
      if (new_locations.length === 0) {
        new_locations = ['Office Hours'];
      }
      if (new_locations.length === 1) {
        setLocation(new_locations[0]);
      }
      setLocations(new_locations);
    }
  }, [queueData]);

  useEffect(() => {
    if (currAssignments) {
      if (currAssignments.length === 1) {
        setAssignmentId(currAssignments[0]._id);
      }
    }
  }, [currAssignments]);

  useEffect(() => {
    if (userData && userData.user_kind === 'student') {
      setName(userData.preferred_name);
      setEmail(userData.email);
    }
  }, [userData]);

  function handleSubmit(event) {
    event.preventDefault();
    setAskDisabled(true);
    callAddQuestionAPI();
  }

  const addQuestionMutation = useMutation(api.home.home_mutate.addQuestion);
  async function callAddQuestionAPI() {
    const result = await addQuestionMutation({
      courseId,
      question: question,
      location: location,
      assignment_id: assignmentId!,
      override_cooldown: false,
      email: email,
    });

    if (result.code === 'COOLDOWN_VIOLATION') {
      if (!result.data) {
        throw new Error('Cooldown violation result data is undefined');
      }

      setTimePassed(Math.round(result.data.waited_time_ms / 1000 / 60));
      setShowCooldownOverlay(true);
    } else if (result.code === 'SUCCESS') {
      clearValues();
      setAskDisabled(false);
    } else {
      throw new Error('Unknown result code: ' + result.code);
    }
  }

  function clearValues() {
    setName('');
    setEmail('');
    setQuestion('');
    setAssignmentId(null);
    setLocation('');

    if (queueData) {
      let new_locations = queueData.current_locations;
      if (new_locations.length === 0) {
        new_locations = ['Office Hours'];
      }
      if (new_locations.length === 1) {
        setLocation(new_locations[0]);
      }
      setLocations(new_locations);
    }

    if (currAssignments) {
      if (currAssignments.length === 1) {
        setAssignmentId(currAssignments[0]._id);
      }
    }
  }

  return (
    <div>
      <BaseCard>
        <CardActions style={{ justifyContent: 'space-between' }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', ml: 2, my: 1 }}>
            Ask A Question
          </Typography>
        </CardActions>
        <Divider></Divider>

        <CardContent sx={{ mx: 1.5 }}>
          <form onSubmit={handleSubmit}>
            {userData && userData.user_kind === 'TA' && (
              <Stack direction="row" justifyContent="left" sx={{ mb: 2 }}>
                <Box sx={{ minWidth: 120, width: '47%' }}>
                  <FormControl required fullWidth>
                    <Input
                      placeholder="Student Name"
                      onChange={(event) => setName(event.target.value)}
                      value={name}
                      fullWidth
                      inputProps={{ maxLength: 50 }}
                    />
                  </FormControl>
                </Box>
                <Box sx={{ minWidth: 120, width: '47%', margin: 'auto', mr: 1 }}>
                  <FormControl required fullWidth>
                    <Input
                      placeholder="Student Email"
                      onChange={(event) => setEmail(event.target.value)}
                      value={email}
                      fullWidth
                      inputProps={{ maxLength: 256 }}
                    />
                  </FormControl>
                </Box>
              </Stack>
            )}
            <Stack direction="row" justifyContent="left">
              <Box sx={{ minWidth: 120, width: '47%' }}>
                <FormControl variant="standard" required fullWidth>
                  <InputLabel id="location-select">Location</InputLabel>
                  <Select
                    labelId="location-select-label"
                    id="location-select"
                    value={location ?? ''}
                    label="Location"
                    onChange={(e) => setLocation(e.target.value)}
                    style={{ textAlign: 'left' }}
                  >
                    {locations.map((loc) => (
                      <MenuItem value={loc} key={loc}>
                        {loc}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ minWidth: 120, width: '47%', margin: 'auto', mr: 1 }}>
                <FormControl variant="standard" required fullWidth>
                  <InputLabel id="topic-select">Topic</InputLabel>
                  <Select
                    labelId="topic-select-label"
                    id="topic-select"
                    value={assignmentId ?? ''}
                    label="Topic"
                    onChange={(e) => setAssignmentId(e.target.value as Id<'assignments'>)}
                    style={{ textAlign: 'left' }}
                  >
                    {(currAssignments || []).map((topic) => (
                      <MenuItem value={topic._id} key={topic._id}>
                        {topic.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Stack>
            <Typography variant="h6" sx={{ fontWeight: 'bold', textAlign: 'left', mt: 2 }}>
              Question:
            </Typography>
            <FormControl required fullWidth sx={{ mt: 0.5 }}>
              <Input
                placeholder="Question (max 256 characters)"
                onChange={(event) => setQuestion(event.target.value)}
                value={question ?? ''}
                fullWidth
                multiline
                inputProps={{ maxLength: 256 }}
                type="text"
              />
            </FormControl>
            <Button
              disabled={askDisabled}
              fullWidth
              variant="contained"
              sx={{
                mt: 3,
                py: 1,
                fontSize: '16px',
                fontWeight: 'bold',
                alignContent: 'center',
              }}
              type="submit"
            >
              Ask
            </Button>
          </form>
        </CardContent>
      </BaseCard>

      <CooldownViolationOverlay
        open={showCooldownOverlay}
        setOpen={setShowCooldownOverlay}
        timePassed={timePassed}
        email={email}
        question={question}
        location={location}
        assignmentId={assignmentId}
      />
    </div>
  );
}
