import { Typography } from '@mui/material';

import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { useCourseId } from '../../../contexts/CourseContext';

import DialogShell from '../../common/dialogs/DialogShell';
import { t } from '../../../themes/styles';

export default function CooldownViolationOverlay(props) {
  const { open, setOpen, email, question, location, assignmentId, timePassed } = props;
  const courseId = useCourseId();

  const queueData = useQuery(api.home.home_get.getQueueData, { courseId });

  const addQuestionMutation = useMutation(api.home.home_mutate.addQuestion);
  async function callAddQuestionAPIOverrideCooldown() {
    if (queueData?.allow_cooldown_override) {
      await addQuestionMutation({
        courseId,
        question,
        location,
        assignment_id: assignmentId,
        override_cooldown: true,
        email,
      }).finally(() => {
        setOpen(false);
      });
    }
  }

  if (!queueData) return null;

  const rejoin_time_mins = queueData.rejoin_time_ms / 1000 / 60;
  const remaining = Math.max(0, rejoin_time_mins - timePassed).toFixed(0);
  const allowOverride = queueData.allow_cooldown_override;

  return (
    <DialogShell
      open={open}
      onClose={() => setOpen(false)}
      title="You're on cooldown"
      subtitle={`Wait ~${remaining} more minute${remaining === '1' ? '' : 's'} before rejoining.`}
      primaryAction={
        allowOverride
          ? { label: 'Override', onClick: callAddQuestionAPIOverrideCooldown }
          : undefined
      }
      secondaryAction={{ label: 'Close', onClick: () => setOpen(false) }}
    >
      <Typography sx={t.bodyMuted}>
        Cooldown is {rejoin_time_mins} minute{rejoin_time_mins === 1 ? '' : 's'} after your last
        question.
        {allowOverride && (
          <>
            {' '}
            Overriding will add you to the queue, but you&apos;ll be frozen until a TA approves you.
          </>
        )}
      </Typography>
    </DialogShell>
  );
}
