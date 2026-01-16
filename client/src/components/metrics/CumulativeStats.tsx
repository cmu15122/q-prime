import {
  Card, Divider, Typography, Grid,
} from '@mui/material';

import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';

export default function CumulativeStats() {
  const numQuestionsData = useQuery(api.metrics.getTotalNumQuestions);
  const avgTimePerQuestionData = useQuery(api.metrics.getTotalAvgTimePerQuestion);
  const avgWaitTimeData = useQuery(api.metrics.getTotalAvgWaitTime);

  const numQuestions = numQuestionsData ? numQuestionsData.numQuestions : 0;
  const avgTimePerQuestion = avgTimePerQuestionData ? avgTimePerQuestionData.averageTime : 0;
  const avgWaitTime = avgWaitTimeData ? avgWaitTimeData.totalAvgWaitTime : 0;

  return (
    <div>
      <Typography variant="h5" sx={{mt: 4, ml: 10}} fontWeight='bold'>
        Cumulative Staff Statistics
      </Typography>
      <Card
        sx={{
          display: 'flex',
          alignItems: 'center',
          maxWidth: '100%',
          border: (theme) => `1px solid ${theme.palette.divider}`,
          borderRadius: 1,
          mt: 4,
          mx: 13,
          overflow: 'hidden',
        }}
      >
        <Grid sx={{px: 4, py: 4, alignItems: 'center', textAlign: 'center'}}>
          <Typography variant='h6' fontWeight='bold'>Total No. of Questions Answered</Typography>
          <Typography variant='h3' sx={{mt: 2}} fontWeight='bold'>{numQuestions}</Typography>
        </Grid>

        <Divider orientation="vertical" variant="middle" flexItem />
        <Grid sx={{px: 4, py: 4, alignItems: 'center', textAlign: 'center'}}>
          <Typography variant='h6' fontWeight='bold'>Average Time Spent per Question (min)</Typography>
          <Typography variant='h3' sx={{mt: 2}} fontWeight='bold'>{Number(avgTimePerQuestion).toFixed(2)}</Typography>
        </Grid>

        <Divider orientation="vertical" variant="middle" flexItem />
        <Grid sx={{px: 4, py: 4, alignItems: 'center', textAlign: 'center'}}>
          <Typography variant='h6' fontWeight='bold'>Average Wait Time (min)</Typography>
          <Typography variant='h3' sx={{mt: 2}} fontWeight='bold'>{Number(avgWaitTime).toFixed(2)}</Typography>
        </Grid>
      </Card>
    </div>
  );
}
