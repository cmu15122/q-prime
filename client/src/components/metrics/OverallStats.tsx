import {
  Card, Divider, Typography, Grid,
} from '@mui/material';

import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';

export default function OverallStats() {
  const numQuestionsTodayData = useQuery(api.metrics.getNumQuestionsToday);
  const numBadQuestionsData = useQuery(api.metrics.getNumBadQuestionsToday);
  const avgWaitTimeData = useQuery(api.metrics.getAvgWaitTimeToday);
  const taStudentRatioData = useQuery(api.metrics.getTaStudentRatioToday);

  const numQuestionsToday = numQuestionsTodayData ? numQuestionsTodayData.numQuestionsToday : 0;
  const numBadQuestions = numBadQuestionsData ? numBadQuestionsData.numBadQuestionsToday : 0;
  const avgWaitTime = avgWaitTimeData ? avgWaitTimeData.avgWaitTime : 0;
  const taStudentRatio = taStudentRatioData ? taStudentRatioData.taStudentRatio : 0;

  return (
    <div>
      <Typography variant="h5" sx={{mt: 4, ml: 10}} fontWeight='bold'>
        Overall Statistics For Today
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
          <Typography variant='h6' fontWeight='bold'>Number of Questions</Typography>
          <Typography variant='h3' sx={{mt: 2}} fontWeight='bold'>{numQuestionsToday}</Typography>
        </Grid>
        <Divider orientation="vertical" variant="middle" flexItem />
        <Grid sx={{px: 4, py: 4, alignItems: 'center', textAlign: 'center'}}>
          <Typography variant='h6' fontWeight='bold'>Number of Bad Questions</Typography>
          <Typography variant='h3' sx={{mt: 2}} fontWeight='bold'>{numBadQuestions}</Typography>
        </Grid>
        <Divider orientation="vertical" variant="middle" flexItem />
        <Grid sx={{px: 4, py: 4, alignItems: 'center', textAlign: 'center'}}>
          <Typography variant='h6' fontWeight='bold'>Average Waiting Time (min)</Typography>
          <Typography variant='h3' sx={{mt: 2}} fontWeight='bold'>{Number(avgWaitTime).toFixed(2)}</Typography>
        </Grid>
        <Divider orientation="vertical" variant="middle" flexItem />
        <Grid sx={{px: 4, py: 4, alignItems: 'center', textAlign: 'center'}}>
          <Typography variant='h6' fontWeight='bold'>TA:Student Ratio</Typography>
          <Typography variant='h3' sx={{mt: 2}} fontWeight='bold'>{taStudentRatio}</Typography>
        </Grid>
      </Card>
    </div>
  );
}
