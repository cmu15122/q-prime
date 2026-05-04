import { useEffect, useState } from 'react';
import { Box, CardContent, TextField, Typography } from '@mui/material';

import BaseCard from '../../common/cards/BaseCard';
import SettingRow from '../common/SettingRow';

import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { useCourseId } from '../../../contexts/CourseContext';

export default function QueueRejoinSettings() {
  const courseId = useCourseId();
  const queueData = useQuery(api.home.home_get.getQueueData, { courseId });

  const [rejoinTime, setRejoinTime] = useState(15);

  useEffect(() => {
    if (queueData) {
      setRejoinTime(Math.round(queueData.rejoin_time_ms / 1000 / 60));
    }
  }, [queueData]);

  const savedRejoinTime = queueData
    ? Math.round(queueData.rejoin_time_ms / 1000 / 60)
    : undefined;
  const dirty = savedRejoinTime !== undefined && rejoinTime !== savedRejoinTime;

  const updateRejoinTimeMutation = useMutation(api.settings.settings_mutate.updateRejoinTime);
  const onSave = async () => {
    await updateRejoinTimeMutation({ courseId, rejoinTime });
  };

  return (
    <BaseCard>
      <CardContent>
        <Typography sx={{ fontWeight: 'bold', mt: 1 }} variant="body1" gutterBottom>
          Queue Rejoin Settings
        </Typography>

        <SettingRow
          label="Queue rejoin time"
          description="How long after leaving the queue students can rejoin"
          dirty={dirty}
          onSave={onSave}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TextField
              type="number"
              size="small"
              value={Number.isNaN(rejoinTime) ? '' : rejoinTime}
              onChange={(e) => setRejoinTime(parseInt(e.target.value, 10))}
              inputProps={{ min: 0, style: { textAlign: 'center' } }}
              sx={{ width: 90 }}
            />
            <Typography variant="body2" color="text.secondary">
              minute(s)
            </Typography>
          </Box>
        </SettingRow>
      </CardContent>
    </BaseCard>
  );
}
