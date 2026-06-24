import { useState, useEffect } from 'react';
import { DateTime } from 'luxon';
import { CardContent, Divider, Typography, TextField, Checkbox, Stack } from '@mui/material';

import BaseCard from '../../common/cards/BaseCard';
import SettingRow from '../common/SettingRow';

import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { useCourseId } from '../../../contexts/CourseContext';
import { DEFAULT_THEME_PRIMARY, DEFAULT_THEME_SECONDARY } from '../../../themes/theme';

const TIMEZONE_SUGGESTIONS = [
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

function SectionHeader({ children, first = false }: { children: React.ReactNode; first?: boolean }) {
  return (
    <>
      {first ? null : <Divider sx={{ my: 2 }} />}
      <Typography
        variant="overline"
        color="text.secondary"
        sx={{ display: 'block', letterSpacing: 1, fontWeight: 700, mt: first ? 1 : 0, mb: 0.5 }}
      >
        {children}
      </Typography>
    </>
  );
}

export default function ConfigSettings() {
  const courseId = useCourseId();
  const queueData = useQuery(api.home.home_get.getQueueData, { courseId });
  const adminSettings = useQuery(api.settings.settings_get.getQueueSettings, { courseId });

  const [slackURL, setSlackURL] = useState('');
  const [questionsURL, setQuestionsURL] = useState('');
  const [allowedEmailDomains, setAllowedEmailDomains] = useState<string[]>([]);
  const [enforceEmailDomain, setEnforceEmailDomain] = useState(true);
  const [allowCDOverride, setAllowCDOverride] = useState(true);
  const [courseName, setCourseName] = useState('');
  const [allowShowOthersTimer, setAllowShowOthersTimer] = useState(false);
  const [timezone, setTimezone] = useState('UTC');
  const [timezoneError, setTimezoneError] = useState('');
  const [themePrimary, setThemePrimary] = useState(DEFAULT_THEME_PRIMARY);
  const [themeSecondary, setThemeSecondary] = useState(DEFAULT_THEME_SECONDARY);
  const [themeStatus, setThemeStatus] = useState<string | null>(null);

  useEffect(() => {
    if (adminSettings) {
      setSlackURL(adminSettings.slackURL || '');
      setEnforceEmailDomain(adminSettings.enforceEmailDomains);
      setCourseName(adminSettings.courseName);
      setAllowShowOthersTimer(adminSettings.allowShowOthersTimer);
      setAllowedEmailDomains(adminSettings.allowedEmailDomains);
      setTimezone(adminSettings.timezone || 'UTC');
      setThemePrimary(adminSettings.themePrimary || DEFAULT_THEME_PRIMARY);
      setThemeSecondary(adminSettings.themeSecondary || DEFAULT_THEME_SECONDARY);
    }
  }, [adminSettings]);

  useEffect(() => {
    if (queueData) {
      setAllowCDOverride(queueData.allow_cooldown_override);
      setQuestionsURL(queueData.questions_policy_url || '');
    }
  }, [queueData]);

  const adminLoaded = adminSettings !== undefined;
  const queueLoaded = queueData !== undefined;

  const courseNameDirty = adminLoaded && courseName !== (adminSettings?.courseName ?? '');
  const timezoneDirty = adminLoaded && timezone !== (adminSettings?.timezone ?? 'UTC');
  const themeDirty =
    adminLoaded &&
    (themePrimary !== (adminSettings?.themePrimary ?? DEFAULT_THEME_PRIMARY) ||
      themeSecondary !== (adminSettings?.themeSecondary ?? DEFAULT_THEME_SECONDARY));
  const enforceEmailDirty =
    adminLoaded && enforceEmailDomain !== adminSettings?.enforceEmailDomains;
  const allowedDomainsDirty =
    adminLoaded &&
    JSON.stringify(allowedEmailDomains) !== JSON.stringify(adminSettings?.allowedEmailDomains ?? []);
  const allowCDOverrideDirty =
    queueLoaded && allowCDOverride !== queueData?.allow_cooldown_override;
  const slackURLDirty = adminLoaded && slackURL !== (adminSettings?.slackURL ?? '');
  const questionsURLDirty = queueLoaded && questionsURL !== (queueData?.questions_policy_url ?? '');
  const allowShowOthersTimerDirty =
    adminLoaded && allowShowOthersTimer !== adminSettings?.allowShowOthersTimer;

  const updateCourseNameMutation = useMutation(api.settings.settings_mutate.updateCourseName);
  const handleUpdateCourseName = async () => {
    await updateCourseNameMutation({ courseId, courseName });
  };

  const updateSlackURLMutation = useMutation(api.settings.settings_mutate.updateSlackURL);
  const handleUpdateSlackURL = async () => {
    await updateSlackURLMutation({ courseId, slackURL });
  };

  const updateQuestionsURLMutation = useMutation(api.settings.settings_mutate.updateQuestionsURL);
  const handleUpdateQuestionsURL = async () => {
    await updateQuestionsURLMutation({ courseId, questionsURL });
  };

  const updateAllowedEmailDomainsMutation = useMutation(
    api.settings.settings_mutate.updateAllowedEmailDomains,
  );
  const handleUpdateAllowedEmailDomains = async () => {
    await updateAllowedEmailDomainsMutation({ courseId, allowedEmailDomains });
  };

  const updateEnforceEmailDomainMutation = useMutation(
    api.settings.settings_mutate.updateEnforceEmailDomain,
  );
  const handleUpdateEnforceEmailDomain = async () => {
    await updateEnforceEmailDomainMutation({ courseId, enforceEmailDomain });
  };

  const updateAllowCooldownOverrideMutation = useMutation(
    api.settings.settings_mutate.updateAllowCooldownOverride,
  );
  const handleCooldownOverrideEnabled = async () => {
    await updateAllowCooldownOverrideMutation({ courseId, allowCDOverride });
  };

  const updateAllowShowOthersTimerMutation = useMutation(
    api.settings.settings_mutate.updateAllowShowOthersTimer,
  );
  const handleUpdateAllowShowOthersTimer = async () => {
    await updateAllowShowOthersTimerMutation({ courseId, allowShowOthersTimer });
  };

  const setCourseThemeMutation = useMutation(api.settings.settings_mutate.setCourseTheme);
  const handleUpdateTheme = async () => {
    setThemeStatus(null);
    const HEX = /^#[0-9a-fA-F]{6}$/;
    if (!HEX.test(themePrimary) || !HEX.test(themeSecondary)) {
      setThemeStatus('Both colors must be 6-digit hex like #14532D');
      return;
    }
    try {
      await setCourseThemeMutation({
        courseId,
        // Send `undefined` when the user has reverted to the defaults so we
        // don't store the defaults in the DB (lets the fallback kick in).
        theme_primary: themePrimary === DEFAULT_THEME_PRIMARY ? undefined : themePrimary,
        theme_secondary: themeSecondary === DEFAULT_THEME_SECONDARY ? undefined : themeSecondary,
      });
      // Force the freshly-published theme CSS into this tab right now;
      // already-cached responses across the app cluster pick it up within 60s.
      // Strip the app base (e.g. /ohq) so the slug is the first app-relative segment.
      const base = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '');
      const rel =
        base && window.location.pathname.startsWith(base)
          ? window.location.pathname.slice(base.length)
          : window.location.pathname;
      const slug = rel.split('/').filter(Boolean)[0];
      if (slug) {
        document.querySelectorAll('link[rel="stylesheet"][href^="/_theme/"]').forEach((el) => {
          const link = el as HTMLLinkElement;
          link.href = `/_theme/${slug}.css?t=${Date.now()}`;
        });
      }
      setThemeStatus('Saved.');
    } catch (err: any) {
      setThemeStatus(err?.data?.message || err?.message || 'Failed to save');
    }
  };

  const updateTimezoneMutation = useMutation((api.settings.settings_mutate as any).updateTimezone);
  const handleUpdateTimezone = async () => {
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
    await updateTimezoneMutation({ courseId, timezone: trimmedTimezone });
  };

  return (
    <BaseCard>
      <CardContent>
        <Typography sx={{ fontWeight: 'bold', mt: 1 }} variant="body1" gutterBottom>
          Configuration Settings
        </Typography>

        <Typography color="text.secondary" sx={{ mt: 1 }}>
          The current semester is {adminSettings?.currSem}. Only [
          {adminSettings?.ownerEmails || []}] can change the semester.
        </Typography>

        <SectionHeader first>Course</SectionHeader>

        <SettingRow
          label="Course Name"
          description="Display name for the course"
          dirty={courseNameDirty}
          onSave={handleUpdateCourseName}
        >
          <TextField
            size="small"
            value={courseName ?? ''}
            onChange={(e) => setCourseName(e.target.value)}
            sx={{ width: 240 }}
          />
        </SettingRow>

        <SettingRow
          label="Timezone"
          description="Timezone used by the server"
          dirty={timezoneDirty}
          onSave={handleUpdateTimezone}
          status={timezoneError || null}
        >
          <TextField
            size="small"
            value={timezone ?? ''}
            onChange={(e) => {
              setTimezone(e.target.value);
              if (timezoneError) setTimezoneError('');
            }}
            placeholder="America/New_York"
            sx={{ width: 280 }}
            inputProps={{ list: 'timezone-options' }}
            error={Boolean(timezoneError)}
          />
          <datalist id="timezone-options">
            {TIMEZONE_SUGGESTIONS.map((zone) => (
              <option value={zone} key={zone} />
            ))}
          </datalist>
        </SettingRow>

        <SettingRow
          label="Theme"
          description="Primary and secondary brand colors"
          dirty={themeDirty}
          onSave={handleUpdateTheme}
          status={themeStatus}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <input
              type="color"
              value={themePrimary}
              onChange={(e) => setThemePrimary(e.target.value)}
              style={{
                width: 36,
                height: 36,
                border: 'none',
                background: 'none',
                padding: 0,
                cursor: 'pointer',
              }}
              aria-label="Primary color"
            />
            <TextField
              size="small"
              value={themePrimary}
              onChange={(e) => setThemePrimary(e.target.value)}
              inputProps={{ pattern: '#[0-9a-fA-F]{6}' }}
              sx={{ width: 120 }}
            />
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <input
              type="color"
              value={themeSecondary}
              onChange={(e) => setThemeSecondary(e.target.value)}
              style={{
                width: 36,
                height: 36,
                border: 'none',
                background: 'none',
                padding: 0,
                cursor: 'pointer',
              }}
              aria-label="Secondary color"
            />
            <TextField
              size="small"
              value={themeSecondary}
              onChange={(e) => setThemeSecondary(e.target.value)}
              inputProps={{ pattern: '#[0-9a-fA-F]{6}' }}
              sx={{ width: 120 }}
            />
          </Stack>
        </SettingRow>

        <SectionHeader>Access</SectionHeader>

        <SettingRow
          label="Enforce Email Domain"
          description={`Require emails that end with: ${(adminSettings?.allowedEmailDomains ?? []).join(', ')}`}
          dirty={enforceEmailDirty}
          onSave={handleUpdateEnforceEmailDomain}
        >
          <Checkbox
            checked={enforceEmailDomain}
            onChange={(e) => setEnforceEmailDomain(e.target.checked)}
            sx={{ p: 0.5 }}
          />
        </SettingRow>

        <SettingRow
          label="Allowed Email Domains"
          description="Allowed email domains, separated by commas"
          dirty={allowedDomainsDirty}
          onSave={handleUpdateAllowedEmailDomains}
        >
          <TextField
            size="small"
            value={allowedEmailDomains.join(', ')}
            onChange={(e) =>
              setAllowedEmailDomains(e.target.value.split(',').map((domain) => domain.trim()))
            }
            sx={{ width: 280 }}
          />
        </SettingRow>

        <SettingRow
          label="Allow Cooldown Override"
          description="Allow students to override cooldown"
          dirty={allowCDOverrideDirty}
          onSave={handleCooldownOverrideEnabled}
        >
          <Checkbox
            checked={allowCDOverride}
            onChange={(e) => setAllowCDOverride(e.target.checked)}
            sx={{ p: 0.5 }}
          />
        </SettingRow>

        <SectionHeader>Integrations</SectionHeader>

        <SettingRow
          label="Slack Webhook URL"
          description="Slack Webhook for pinging channel when wait time is long"
          dirty={slackURLDirty}
          onSave={handleUpdateSlackURL}
        >
          <TextField
            size="small"
            value={slackURL ?? ''}
            onChange={(e) => setSlackURL(e.target.value)}
            placeholder="https://hooks.slack.com/..."
            sx={{ width: 320 }}
          />
        </SettingRow>

        <SettingRow
          label="Questions Guide URL"
          description="Link shown to students when Asked to Fix"
          dirty={questionsURLDirty}
          onSave={handleUpdateQuestionsURL}
        >
          <TextField
            size="small"
            value={questionsURL ?? ''}
            onChange={(e) => setQuestionsURL(e.target.value)}
            placeholder="https://..."
            sx={{ width: 320 }}
          />
        </SettingRow>

        <SectionHeader>TA permissions</SectionHeader>

        <SettingRow
          label="Show Others' Helping Time"
          description="Allow TAs to see how long other TAs have been helping students"
          dirty={allowShowOthersTimerDirty}
          onSave={handleUpdateAllowShowOthersTimer}
        >
          <Checkbox
            checked={allowShowOthersTimer}
            onChange={(e) => setAllowShowOthersTimer(e.target.checked)}
            sx={{ p: 0.5 }}
          />
        </SettingRow>
      </CardContent>
    </BaseCard>
  );
}
