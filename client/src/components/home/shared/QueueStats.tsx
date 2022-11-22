import React, {useState, useEffect, useContext} from 'react';
import {
  CardContent, Divider, Stack, Typography, useTheme,
} from '@mui/material';

import BaseCard from '../../common/cards/BaseCard';

import {socketSubscribeTo} from '../../../services/SocketsService';
import {useQueueDataContext} from '../../../App';

export default function QueueStats() {
  const theme = useTheme();

  const {queueData, setQueueData} = useQueueDataContext();

  // TODO : change based on whether on queue or not

  useEffect(() => {
    socketSubscribeTo('waittimes', (data) => {
      setQueueData({...queueData, waitTime: Math.floor(data.numUnhelped * data.minsPerStudent / data.numTAs), numStudents: data.numStudents});
    });
  }, []);

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
            <Typography variant='body1' sx={{mt: 1.5, mb: 2}}>The estimated wait time is <strong>{queueData.waitTime} minutes</strong> from the end of the queue.</Typography>
          </div>
        </Stack>
      </CardContent>
    </BaseCard>
  );
}
