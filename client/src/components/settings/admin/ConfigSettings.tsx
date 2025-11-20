import React, { useState, useEffect } from "react";
import {
  Button,
  CardContent,
  Typography,
  TextField,
  Checkbox,
  Stack,
  Tooltip,
} from "@mui/material";

import BaseCard from "../../common/cards/BaseCard";

import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";

export default function ConfigSettings() {
  const queueData = useQuery(api.home.home_get.getQueueData);
  const userData = useQuery(api.home.home_get.getUserData);
  const adminSettings = useQuery(api.settings.settings_get.getQueueSettings);

  const [currSem, setCurrSem] = useState<string>("");
  const [slackURL, setSlackURL] = useState("");
  const [questionsURL, setQuestionsURL] = useState("");
  const [enforceEmailDomain, setEnforceEmailDomain] = useState(true);
  const [allowCDOverride, setAllowCDOverride] = useState(true);
  const [courseName, setCourseName] = useState("");
  const [allowShowOthersTimer, setAllowShowOthersTimer] = useState(false);

  // TODO CONVEX ADD ALLOWED DOMAINS SETTING

  useEffect(() => {
    if (adminSettings) {
      setCurrSem(adminSettings.currSem);
      setSlackURL(adminSettings.slackURL || "");
      setEnforceEmailDomain(adminSettings.enforceEmailDomains);
      setCourseName(adminSettings.courseName);
      setAllowShowOthersTimer(adminSettings.allowShowOthersTimer);
    }
  }, [adminSettings]);

  useEffect(() => {
    if (queueData) {
      setAllowCDOverride(queueData.allow_cooldown_override);
      setQuestionsURL(queueData.questions_policy_url || "");
    }
  }, [queueData]);

  const updateCourseNameMutation = useMutation(
    api.settings.settings_mutate.updateCourseName,
  );
  const handleUpdateCourseName = async (event) => {
    event.preventDefault();
    await updateCourseNameMutation({ courseName: courseName });
  };

  const changeSemesterMutation = useMutation(
    api.settings.settings_mutate.changeSemester,
  );
  const handleUpdateSemester = async (event) => {
    event.preventDefault();
    await changeSemesterMutation({ new_sem_name: currSem });
  };

  const updateSlackURLMutation = useMutation(
    api.settings.settings_mutate.updateSlackURL,
  );
  const handleUpdateSlackURL = async (event) => {
    event.preventDefault();
    await updateSlackURLMutation({ slackURL: slackURL });
  };

  const updateQuestionsURLMutation = useMutation(
    api.settings.settings_mutate.updateQuestionsURL,
  );
  const handleUpdateQuestionsURL = async (event) => {
    event.preventDefault();
    await updateQuestionsURLMutation({ questionsURL: questionsURL });
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

  return (
    <BaseCard>
      <CardContent>
        <Typography
          sx={{ fontWeight: "bold", ml: 1, mt: 1 }}
          variant="body1"
          gutterBottom
        >
          Configuration Settings
        </Typography>

        <Stack spacing={2} sx={{ mt: 2 }}>
          <form onSubmit={handleUpdateCourseName}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Typography>Course Name:</Typography>
              <TextField
                size="small"
                value={courseName ?? ""}
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

          <form onSubmit={handleUpdateSemester}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Typography>Current Semester:</Typography>
              <TextField
                size="small"
                value={currSem ?? ""}
                onChange={(e) => setCurrSem(e.target.value)}
                disabled={!(userData?.is_owner || false)}
                inputProps={{ maxLength: 3 }}
                sx={{ width: 80 }}
              />
              {!userData?.is_owner ? null : (
                <Tooltip
                  title={
                    <Typography>
                      Update Current Semester First, this initializes your
                      semester!
                    </Typography>
                  }
                  placement="right"
                  arrow
                  open={currSem != undefined && adminSettings?.currSem === ""}
                  enterDelay={1000}
                >
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={!(userData?.is_owner || false)}
                  >
                    Save
                  </Button>
                </Tooltip>
              )}
              <Typography variant="caption" color="text.secondary">
                {!(userData?.is_owner || false)
                  ? `Only ${adminSettings?.ownerEmails || []} can change semester`
                  : "Each semester has its own settings and stats"}
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
                Require emails that end with:
                {adminSettings?.allowedEmailDomains.join(", ")}
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
                value={slackURL ?? ""}
                onChange={(e) => setSlackURL(e.target.value)}
                placeholder="https://hooks.slack.com/..."
                sx={{ width: 250 }}
              />
              <Button type="submit" variant="contained">
                Save
              </Button>
              <Typography variant="caption" color="text.secondary">
                URL for Slack notifications
              </Typography>
            </Stack>
          </form>

          <form onSubmit={handleUpdateQuestionsURL}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Typography>Questions Guide URL:</Typography>
              <TextField
                size="small"
                value={questionsURL ?? ""}
                onChange={(e) => setQuestionsURL(e.target.value)}
                placeholder="https://..."
                sx={{ width: 250 }}
              />
              <Button type="submit" variant="contained">
                Save
              </Button>
              <Typography variant="caption" color="text.secondary">
                URL for questions guide
              </Typography>
            </Stack>
          </form>

          <form onSubmit={handleUpdateAllowShowOthersTimer}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography>
                Allow Users to Show Others&apos; Helping Time:
              </Typography>
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
