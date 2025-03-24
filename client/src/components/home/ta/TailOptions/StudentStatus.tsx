import React, { useContext } from 'react';
import { Typography, useTheme } from '@mui/material';

import { StudentStatusValues } from '../../../../services/StudentStatus';
import { UserDataContext } from '../../../../contexts/UserDataContext';

export default function StudentStatus(props) {
  const { student } = props;
  const theme = useTheme();

  const { userData } = useContext(UserDataContext);

  const status = student.status;

  const chooseText = (status) => {
    switch (status) {
      case StudentStatusValues.BEING_HELPED: {
        if (student.helpingTAInfo?.taAndrewID === userData.andrewID) {
          return 'You are helping';
        } else {
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
