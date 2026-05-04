import { useState, useEffect } from 'react';
import {
  Box,
  CardContent,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from '@mui/material';

import CooldownViolationOverlay from './CooldownViolationOverlay';
import BaseCard from '../../common/cards/BaseCard';
import OhqButton from '../../common/buttons/OhqButton';

import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { Id } from '../../../../convex/_generated/dataModel';
import { useCourseId } from '../../../contexts/CourseContext';
import { t } from '../../../themes/styles';

export default function AskQuestion() {
  const courseId = useCourseId();
  const queueData = useQuery(api.home.home_get.getQueueData, { courseId });
  const userData = useQuery(api.home.home_get.getUserData, { courseId });

  const currAssignments = queueData?.current_assignments || [];

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
    if (currAssignments && currAssignments.length === 1) {
      setAssignmentId(currAssignments[0]._id);
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
      question,
      location,
      assignment_id: assignmentId!,
      override_cooldown: false,
      email,
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

    if (currAssignments && currAssignments.length === 1) {
      setAssignmentId(currAssignments[0]._id);
    }
  }

  return (
    <Box>
      <BaseCard>
        <Box sx={{ padding: '16px 20px 12px' }}>
          <Box component="h2" sx={t.cardTitle}>
            Ask a question
          </Box>
        </Box>
        <Divider sx={{ mt: 1, mb: 3 }} />

        <CardContent sx={{ p: '0px 12px' }}>
          <Box component="form" onSubmit={handleSubmit}>
            {userData && userData.user_kind === 'TA' && (
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
                <TextField
                  required
                  fullWidth
                  variant="outlined"
                  label="Student name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  inputProps={{ maxLength: 50 }}
                />
                <TextField
                  required
                  fullWidth
                  variant="outlined"
                  label="Student email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  inputProps={{ maxLength: 256 }}
                />
              </Stack>
            )}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <FormControl required fullWidth variant="outlined">
                <InputLabel id="location-select-label">Location</InputLabel>
                <Select
                  labelId="location-select-label"
                  id="location-select"
                  value={location ?? ''}
                  label="Location"
                  onChange={(e) => setLocation(e.target.value)}
                >
                  {locations.map((loc) => (
                    <MenuItem value={loc} key={loc}>
                      {loc}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl required fullWidth variant="outlined">
                <InputLabel id="topic-select-label">Topic</InputLabel>
                <Select
                  labelId="topic-select-label"
                  id="topic-select"
                  value={assignmentId ?? ''}
                  label="Topic"
                  onChange={(e) => setAssignmentId(e.target.value as Id<'assignments'>)}
                >
                  {(currAssignments || []).map((topic) => (
                    <MenuItem value={topic._id} key={topic._id}>
                      {topic.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
            <TextField
              required
              fullWidth
              multiline
              variant="outlined"
              label="Question"
              placeholder="Question (max 256 characters)"
              value={question ?? ''}
              onChange={(event) => setQuestion(event.target.value)}
              inputProps={{ maxLength: 256 }}
              sx={{ mt: 2 }}
            />
            <OhqButton
              variant="primary"
              type="submit"
              fullWidth
              disabled={askDisabled}
              sx={{ mt: 3, py: 1.25 }}
            >
              Ask
            </OhqButton>
          </Box>
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
    </Box>
  );
}
