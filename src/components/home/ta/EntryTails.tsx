import { useState } from 'react';
import type { ReactNode } from 'react';
import { Stack, Typography } from '@mui/material';
import { Help, Chat, Delete } from '@mui/icons-material';

import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { Doc } from '../../../../convex/_generated/dataModel';
import { useCourseId } from '../../../contexts/CourseContext';

import OhqButton from '../../common/buttons/OhqButton';
import HelpTimer from '../../common/timer/HelpTimer';
import OverflowMenu, { OverflowMenuItem } from '../../common/menus/OverflowMenu';
import DialogShell from '../../common/dialogs/DialogShell';
import MessageDialog from './dialogs/MessageDialog';
import { t } from '../../../themes/styles';

export default function EntryTails(props) {
  const {
    index,
    isHelping,
    tempDisabled,
    currentTime,
    showCooldownApproval,
    handleClickHelp,
    handleCancel,
    removeStudent,
    handleClickUnfreeze,
    handleFix,
    approveCooldownOverride,
  } = props;
  const student: Doc<'ohq'> = props['student'];
  const courseId = useCourseId();
  const userData = useQuery(api.home.home_get.getUserData, { courseId });
  const queueData = useQuery(api.home.home_get.getQueueData, { courseId });

  const [openMessage, setOpenMessage] = useState(false);
  const [openRemoveConfirm, setOpenRemoveConfirm] = useState(false);

  const status = student.status;
  const isOwnHelp =
    status === 'being_helped' && student.helping_ta?.ta_id === userData?.ta_data?.ta_id;

  const showSelfTimer = isOwnHelp && userData?.ta_data?.show_self_timer;
  const showOthersTimer =
    !isOwnHelp &&
    status === 'being_helped' &&
    userData?.ta_data?.show_others_timer &&
    queueData?.allow_tas_show_others_timer;
  const elapsedMs = student.help_start_time_ms ? currentTime - student.help_start_time_ms : 0;

  const overflowItems: OverflowMenuItem[] = [];

  if (status === 'waiting' || status === 'fixing_question') {
    overflowItems.push({
      icon: <Help fontSize="small" />,
      label: 'Ask to fix',
      onClick: () => handleFix(index),
    });
    overflowItems.push({
      icon: <Chat fontSize="small" />,
      label: 'Message',
      onClick: () => setOpenMessage(true),
    });
  }
  if (status !== 'being_helped' || isOwnHelp) {
    overflowItems.push({
      icon: <Delete fontSize="small" />,
      label: 'Remove',
      onClick: () => setOpenRemoveConfirm(true),
      variant: 'danger',
    });
  }

  let actionElement: ReactNode = null;
  switch (status) {
    case 'being_helped':
      if (isOwnHelp) {
        actionElement = (
          <>
            {showSelfTimer && <HelpTimer elapsedMs={elapsedMs} />}
            <OhqButton variant="ghost" disabled={tempDisabled} onClick={() => handleCancel(index)}>
              Cancel
            </OhqButton>
            <OhqButton
              variant="primary"
              disabled={tempDisabled}
              onClick={() => removeStudent(index, true)}
            >
              Done
            </OhqButton>
          </>
        );
      } else if (showOthersTimer) {
        actionElement = <HelpTimer elapsedMs={elapsedMs} />;
      }
      break;
    case 'frozen':
      actionElement = (
        <OhqButton variant="warning" onClick={() => handleClickUnfreeze(index)}>
          Unfreeze
        </OhqButton>
      );
      break;
    case 'cooldown_violation':
      actionElement = (
        <OhqButton
          variant="primary"
          disabled={isHelping || tempDisabled}
          onClick={() =>
            showCooldownApproval ? approveCooldownOverride() : handleClickHelp(index)
          }
        >
          {showCooldownApproval ? 'Approve' : 'Help'}
        </OhqButton>
      );
      break;
    case 'waiting':
    case 'fixing_question':
    default:
      actionElement = (
        <OhqButton
          variant="primary"
          disabled={isHelping || tempDisabled}
          onClick={() => handleClickHelp(index)}
        >
          Help
        </OhqButton>
      );
      break;
  }

  return (
    <Stack
      direction="column"
      alignItems="flex-end"
      spacing={0.5}
      sx={{ mr: { xs: 0, sm: 1 }, my: 1 }}
    >
      <Stack direction="row" alignItems="center" spacing={0.75}>
        {actionElement}
        {overflowItems.length > 0 && <OverflowMenu items={overflowItems} />}
      </Stack>
      <MessageDialog isOpen={openMessage} onClose={() => setOpenMessage(false)} student={student} />
      <DialogShell
        open={openRemoveConfirm}
        onClose={() => setOpenRemoveConfirm(false)}
        title="Remove this student?"
        primaryAction={{
          label: 'Remove',
          variant: 'danger',
          onClick: () => {
            setOpenRemoveConfirm(false);
            removeStudent(index, false);
          },
        }}
        secondaryAction={{ label: 'Cancel', onClick: () => setOpenRemoveConfirm(false) }}
      >
        <Typography sx={t.bodyMuted}>
          <strong>{student.student_name}</strong> will be taken off the queue and notified.
        </Typography>
      </DialogShell>
    </Stack>
  );
}
