import React, {useContext} from 'react';
import {
  CardContent, Divider, Stack, Typography, useTheme,
} from '@mui/material';

import BaseCard from '../../common/cards/BaseCard';

import {QueueDataContext} from '../../../contexts/QueueDataContext';

export default function QueueStats() {
  const theme = useTheme();

  const {queueData} = useContext(QueueDataContext);

  return (
    <BaseCard>
      <CardContent>
        <Stack
          direction='row'
          divider={<Divider orientation='vertical' flexItem />}
          spacing={2}
          alignItems='center'
          justifyContent='space-evenly'
          sx={{pt: 1}}
        >
          <div>
            <Typography variant='h5' fontWeight='bold' sx={{mt: 2}}>The queue is</Typography>
            {
              queueData.queueFrozen ?
                <Typography color={theme.palette.error.main} variant='h5' fontWeight='bold' sx={{mt: 1, mb: 2}}>CLOSED</Typography> :
                <Typography color={theme.palette.success.main} variant='h5' fontWeight='bold' sx={{mt: 1, mb: 2}}>OPEN</Typography>
            }
          </div>
          <div>
            <Typography variant='body1' sx={{mt: 2}}>There are <strong>{queueData.numStudents} students</strong> on the queue.</Typography>
            <Typography variant='body1' sx={{mt: 1.5, mb: 2}}>The estimated wait time is <strong>{queueData.numTAs === 0 ? 0 : Math.floor(queueData.numUnhelped * queueData.minsPerStudent / queueData.numTAs)} minutes</strong> from the end of the queue.</Typography>
          </div>
        </Stack>
      </CardContent>
    </BaseCard>
  );
}
