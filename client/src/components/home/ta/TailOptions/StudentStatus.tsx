import React, { useContext } from 'react';
import { Typography, useTheme } from '@mui/material';

import { StudentStatusValues } from '../../../../services/StudentStatus';
import { UserDataContext } from '../../../../contexts/UserDataContext';
import { QueueDataContext } from '../../../../contexts/QueueDataContext';

export default function StudentStatus(props) {
  const { student, currentTime } = props;
  const theme = useTheme();

  const { userData } = useContext(UserDataContext);
  const { queueData } = useContext(QueueDataContext);

  const status = student.status;

  const formatTime = (seconds) => {
    // Handle negative or zero seconds
    if (seconds <= 0) return '0:00';

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  // Calculate elapsed time based on the provided currentTime
  const getElapsedTime = () => {
    if (
      status === StudentStatusValues.BEING_HELPED &&
      student.helpingTAInfo?.helpStartTime
    ) {
      const startTime = new Date(student.helpingTAInfo.helpStartTime).getTime();
      return Math.floor((currentTime - startTime) / 1000);
    }
    return 0;
  };

  const chooseText = (status) => {
    switch (status) {
      case StudentStatusValues.BEING_HELPED: {
        if (student.helpingTAInfo?.taAndrewID === userData.andrewID) {
          // Show self timer if enabled
          if (
            userData.taSettings?.showSelfTimer &&
            student.helpingTAInfo?.helpStartTime
          ) {
            return `You have been helping for ${formatTime(getElapsedTime())}`;
          }
          return 'You are helping';
        } else {
          // Show others timer if enabled (both user setting and admin setting)
          if (
            userData.taSettings?.showOthersTimer &&
            queueData.allowShowOthersTimer &&
            student.helpingTAInfo?.helpStartTime
          ) {
            return `${student?.helpingTAInfo?.taPrefName} has been helping for ${formatTime(getElapsedTime())}`;
          }
          return `${student?.helpingTAInfo?.taPrefName} is Helping`;
        }
      }
      case StudentStatusValues.FIXING_QUESTION:
        return 'Updating Question';
      case StudentStatusValues.FROZEN:
        return 'Frozen';
      case StudentStatusValues.COOLDOWN_VIOLATION:
        return 'Joined Before Cooldown';
      case StudentStatusValues.RECEIVED_MESSAGE:
        return 'Received Message';
      default:
        return '';
    }
  };

  return (
    <Typography
      fontSize="13px"
      color={theme.palette.success.main}
      style={{ overflowWrap: 'break-word' }}
      sx={{ mb: { xs: 1, sm: 0.5 } }}
    >
      {chooseText(status)}
    </Typography>
  );
}
