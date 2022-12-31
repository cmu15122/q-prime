import React, {useState, useEffect} from 'react';
import {
  Card, Divider, Typography, Grid,
} from '@mui/material';


import MetricsService from '../../services/MetricsService';

export default function OverallStats() {
  const [numQuestionsToday, setNumQuestionsToday] = useState(0);
  const [numBadQuestions, setNumBadQuestions] = useState(0);
  const [avgWaitTime, setAvgWaitTime] = useState(0);
  const [taStudentRatio, setTaStudentRatio] = useState(0);

  useEffect(() => {
    MetricsService.getNumQuestionsToday().then((res) => {
      setNumQuestionsToday(res.data.numQuestionsToday);
    });

    MetricsService.getNumBadQuestions().then((res) => {
      setNumBadQuestions(res.data.numBadQuestions);
    });

    MetricsService.getAvgWaitTime().then((res) => {
      setAvgWaitTime(res.data.avgWaitTime);
    });

    MetricsService.getTaStudentRatio().then((res) => {
      setTaStudentRatio(res.data.taStudentRatio);
    });
  }, []);

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
