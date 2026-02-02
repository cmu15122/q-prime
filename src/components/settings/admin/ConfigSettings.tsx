import { useState, useEffect } from 'react';
import { DateTime } from 'luxon';
import { Button, CardContent, Typography, TextField, Checkbox, Stack } from '@mui/material';

import BaseCard from '../../common/cards/BaseCard';

import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';

export default function ConfigSettings() {
  const queueData = useQuery(api.home.home_get.getQueueData);
  const adminSettings = useQuery(api.settings.settings_get.getQueueSettings);

  const [slackURL, setSlackURL] = useState('');
  const [questionsURL, setQuestionsURL] = useState('');
  const [allowedEmailDomains, setAllowedEmailDomains] = useState<string[]>([]);
  const [enforceEmailDomain, setEnforceEmailDomain] = useState(true);
  const [allowCDOverride, setAllowCDOverride] = useState(true);
  const [courseName, setCourseName] = useState('');
  const [allowShowOthersTimer, setAllowShowOthersTimer] = useState(false);
  const [timezone, setTimezone] = useState('UTC');
  const [timezoneError, setTimezoneError] = useState('');

  const timezoneSuggestions = [
    'UTC',
    'America/Los_Angeles',
    'America/Denver',
    'America/Chicago',
    'America/New_York',
    'America/Sao_Paulo',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Europe/Athens',
    'Africa/Johannesburg',
    'Asia/Dubai',
    'Asia/Kolkata',
    'Asia/Singapore',
    'Asia/Tokyo',
    'Australia/Sydney',
    'Pacific/Auckland',
  ];

  useEffect(() => {
    if (adminSettings) {
      setSlackURL(adminSettings.slackURL || '');
      setEnforceEmailDomain(adminSettings.enforceEmailDomains);
      setCourseName(adminSettings.courseName);
      setAllowShowOthersTimer(adminSettings.allowShowOthersTimer);
      setAllowedEmailDomains(adminSettings.allowedEmailDomains);
      setTimezone(adminSettings.timezone || 'UTC');
    }
  }, [adminSettings]);

  useEffect(() => {
    if (queueData) {
      setAllowCDOverride(queueData.allow_cooldown_override);
      setQuestionsURL(queueData.questions_policy_url || '');
    }
  }, [queueData]);

  const updateCourseNameMutation = useMutation(api.settings.settings_mutate.updateCourseName);
  const handleUpdateCourseName = async (event) => {
    event.preventDefault();
    await updateCourseNameMutation({ courseName: courseName });
  };

  const updateSlackURLMutation = useMutation(api.settings.settings_mutate.updateSlackURL);
  const handleUpdateSlackURL = async (event) => {
    event.preventDefault();
    await updateSlackURLMutation({ slackURL: slackURL });
  };

  const updateQuestionsURLMutation = useMutation(api.settings.settings_mutate.updateQuestionsURL);
  const handleUpdateQuestionsURL = async (event) => {
    event.preventDefault();
    await updateQuestionsURLMutation({ questionsURL: questionsURL });
  };

  const updateAllowedEmailDomainsMutation = useMutation(
    api.settings.settings_mutate.updateAllowedEmailDomains,
  );
  const handleUpdateAllowedEmailDomains = async (event) => {
    event.preventDefault();
    await updateAllowedEmailDomainsMutation({ allowedEmailDomains: allowedEmailDomains });
  };

  const updateEnforceEmailDomainMutation = useMutation(
    api.settings.settings_mutate.updateEnforceEmailDomain,
  );
  const handleUpdateEnforceEmailDomain = async (event) => {
    event.preventDefault();

    await updateEnforceEmailDomainMutation({
      enforceEmailDomain: enforceEmailDomain,
    });
  };

  const updateAllowCooldownOverrideMutation = useMutation(
    api.settings.settings_mutate.updateAllowCooldownOverride,
  );
  const handleCooldownOverrideEnabled = async (event) => {
    event.preventDefault();
    await updateAllowCooldownOverrideMutation({
      allowCDOverride: allowCDOverride,
    });
  };

  const updateAllowShowOthersTimerMutation = useMutation(
    api.settings.settings_mutate.updateAllowShowOthersTimer,
  );
  const handleUpdateAllowShowOthersTimer = async (event) => {
    event.preventDefault();
    await updateAllowShowOthersTimerMutation({
      allowShowOthersTimer: allowShowOthersTimer,
    });
  };

  const updateTimezoneMutation = useMutation((api.settings.settings_mutate as any).updateTimezone);
  const handleUpdateTimezone = async (event) => {
    event.preventDefault();
    const trimmedTimezone = timezone.trim();
    if (!trimmedTimezone) {
      setTimezoneError('Timezone cannot be empty');
      return;
    }
    const dt = DateTime.now().setZone(trimmedTimezone);
    if (!dt.isValid) {
      setTimezoneError('Invalid timezone');
      return;
    }
    setTimezoneError('');
    await updateTimezoneMutation({ timezone: trimmedTimezone });
  };

  return (
    <BaseCard>
      <CardContent>
        <Typography sx={{ fontWeight: 'bold', mt: 1 }} variant="body1" gutterBottom>
          Configuration Settings
        </Typography>

        <Stack spacing={2} sx={{ mt: 2 }}>
          <Typography color="text.secondary">
            The current semester is {adminSettings?.currSem}. Only [
            {adminSettings?.ownerEmails || []}] can change the semester.
          </Typography>

          <form onSubmit={handleUpdateCourseName}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Typography>Course Name:</Typography>
              <TextField
                size="small"
                value={courseName ?? ''}
                onChange={(e) => setCourseName(e.target.value)}
                sx={{ width: 200 }}
              />
              <Button type="submit" variant="contained">
                Save
              </Button>
              <Typography variant="caption" color="text.secondary">
                Display name for the course
              </Typography>
            </Stack>
          </form>

          <form onSubmit={handleUpdateTimezone}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Typography>Timezone:</Typography>
              <TextField
                size="small"
                value={timezone ?? ''}
                onChange={(e) => {
                  setTimezone(e.target.value);
                  if (timezoneError) {
                    setTimezoneError('');
                  }
                }}
                placeholder="America/New_York"
                sx={{ width: 250 }}
                inputProps={{ list: 'timezone-options' }}
                error={Boolean(timezoneError)}
                helperText={timezoneError || undefined}
                FormHelperTextProps={{ sx: { m: 0 } }}
              />
              <datalist id="timezone-options">
                {timezoneSuggestions.map((zone) => (
                  <option value={zone} key={zone} />
                ))}
              </datalist>
              <Button type="submit" variant="contained">
                Save
              </Button>
              <Typography variant="caption" color="text.secondary">
                Timezone used by the server
              </Typography>
            </Stack>
          </form>

          <form onSubmit={handleUpdateEnforceEmailDomain}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography>Enforce Email Domain:</Typography>
              <Checkbox
                checked={enforceEmailDomain}
                onChange={(e) => setEnforceEmailDomain(e.target.checked)}
              />
              <Button type="submit" variant="contained">
                Save
              </Button>
              <Typography variant="caption" color="text.secondary">
                Require emails that end with: {adminSettings?.allowedEmailDomains.join(', ')}
              </Typography>
            </Stack>
          </form>

          <form onSubmit={handleUpdateAllowedEmailDomains}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography>Allowed Email Domains:</Typography>
              <TextField
                size="small"
                value={allowedEmailDomains.join(', ')}
                onChange={(e) =>
                  setAllowedEmailDomains(e.target.value.split(', ').map((domain) => domain.trim()))
                }
                sx={{ width: 250 }}
              />
              <Button type="submit" variant="contained">
                Save
              </Button>
              <Typography variant="caption" color="text.secondary">
                Allowed email domains, separated by commas
              </Typography>
            </Stack>
          </form>

          <form onSubmit={handleCooldownOverrideEnabled}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography>Allow Cooldown Override:</Typography>
              <Checkbox
                checked={allowCDOverride}
                onChange={(e) => setAllowCDOverride(e.target.checked)}
              />
              <Button type="submit" variant="contained">
                Save
              </Button>
              <Typography variant="caption" color="text.secondary">
                Allow students to override cooldown
              </Typography>
            </Stack>
          </form>

          <form onSubmit={handleUpdateSlackURL}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Typography>Slack Webhook URL:</Typography>
              <TextField
                size="small"
                value={slackURL ?? ''}
                onChange={(e) => setSlackURL(e.target.value)}
                placeholder="https://hooks.slack.com/..."
                sx={{ width: 250 }}
              />
              <Button type="submit" variant="contained">
                Save
              </Button>
              <Typography variant="caption" color="text.secondary">
                Slack Webhook for pinging channel when wait time is long
              </Typography>
            </Stack>
          </form>

          <form onSubmit={handleUpdateQuestionsURL}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Typography>Questions Guide URL:</Typography>
              <TextField
                size="small"
                value={questionsURL ?? ''}
                onChange={(e) => setQuestionsURL(e.target.value)}
                placeholder="https://..."
                sx={{ width: 250 }}
              />
              <Button type="submit" variant="contained">
                Save
              </Button>
              <Typography variant="caption" color="text.secondary">
                Link shown to students when Asked to Fix
              </Typography>
            </Stack>
          </form>

          <form onSubmit={handleUpdateAllowShowOthersTimer}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography>Allow Users to Show Others&apos; Helping Time:</Typography>
              <Checkbox
                checked={allowShowOthersTimer}
                onChange={(e) => setAllowShowOthersTimer(e.target.checked)}
              />
              <Button type="submit" variant="contained">
                Save
              </Button>
              <Typography variant="caption" color="text.secondary">
                Allow TAs to see how long other TAs have been helping students
              </Typography>
            </Stack>
          </form>
        </Stack>
      </CardContent>
    </BaseCard>
  );
}
