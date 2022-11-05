import React from 'react';
import {
  Typography, useTheme,
} from '@mui/material';

import {StudentStatusValues} from '../../../../services/StudentStatus';

export default function StudentStatus(props) {
  const {student, index, isHelping, helpIdx} = props;
  const theme = useTheme();

  const status = student.status;

  const chooseText = (status) => {
    switch (status) {
      case StudentStatusValues.BEING_HELPED: {
        if (isHelping && (index === helpIdx)) {
          return 'You are helping';
        } else {
          return `${student.taPrefName} is Helping`;
        }
      }
      case StudentStatusValues.FIXING_QUESTION: return 'Updating Question';
      case StudentStatusValues.FROZEN: return 'Frozen';
      case StudentStatusValues.COOLDOWN_VIOLATION: return 'Joined Before Cooldown';
      case StudentStatusValues.RECEIVED_MESSAGE: return 'Received Message';
      default: return '';
    }
  };

  return (
    <Typography
      fontSize='13px'
      color={theme.palette.success.main}
      style={{overflowWrap: 'break-word'}}
      sx={{mb: {xs: 1, sm: 0.5}}}
    >
      {chooseText(status)}
    </Typography>
  );
}
