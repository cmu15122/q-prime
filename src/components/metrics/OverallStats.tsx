import { Card, Divider, Typography, Grid } from '@mui/material';

import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useCourseId } from '../../contexts/CourseContext';

export default function OverallStats() {
  const courseId = useCourseId();
  const numQuestionsTodayData = useQuery(api.metrics.getNumQuestionsToday, { courseId });
  const numBadQuestionsData = useQuery(api.metrics.getNumBadQuestionsToday, { courseId });
  const avgWaitTimeData = useQuery(api.metrics.getAvgWaitTimeToday, { courseId });
  const taStudentRatioData = useQuery(api.metrics.getTaStudentRatioToday, { courseId });

  const numQuestionsToday = numQuestionsTodayData ? numQuestionsTodayData.numQuestionsToday : 0;
  const numBadQuestions = numBadQuestionsData ? numBadQuestionsData.numBadQuestionsToday : 0;
  const avgWaitTime = avgWaitTimeData ? avgWaitTimeData.avgWaitTime : '0:00';
  const taStudentRatio = taStudentRatioData ? taStudentRatioData.taStudentRatio : '0:0';

  return (
    <div>
      <Typography variant="h5" sx={{ mt: 4, ml: 10 }} fontWeight="bold">
        Overall Statistics For Today
      </Typography>
      <Card
        sx={{
          display: 'flex',
          alignItems: 'center',
          maxWidth: '100%',
          border: (theme) => `1px solid ${theme.palette.divider}`,
          borderRadius: 1,
          mt: 1,
          mx: 10,
          overflow: 'hidden',
        }}
      >
        <Grid sx={{ px: 4, py: 4, alignItems: 'center', textAlign: 'center' }}>
          <Typography variant="h6" fontWeight="bold">
            Number of Questions
          </Typography>
          <Typography variant="h3" sx={{ mt: 2 }} fontWeight="bold">
            {numQuestionsToday}
          </Typography>
        </Grid>
        <Divider orientation="vertical" variant="middle" flexItem />
        <Grid sx={{ px: 4, py: 4, alignItems: 'center', textAlign: 'center' }}>
          <Typography variant="h6" fontWeight="bold">
            Number of Bad Questions
          </Typography>
          <Typography variant="h3" sx={{ mt: 2 }} fontWeight="bold">
            {numBadQuestions}
          </Typography>
        </Grid>
        <Divider orientation="vertical" variant="middle" flexItem />
        <Grid sx={{ px: 4, py: 4, alignItems: 'center', textAlign: 'center' }}>
          <Typography variant="h6" fontWeight="bold">
            Average Waiting Time (min)
          </Typography>
          <Typography variant="h3" sx={{ mt: 2 }} fontWeight="bold">
            {avgWaitTime}
          </Typography>
        </Grid>
        <Divider orientation="vertical" variant="middle" flexItem />
        <Grid sx={{ px: 4, py: 4, alignItems: 'center', textAlign: 'center' }}>
          <Typography variant="h6" fontWeight="bold">
            TA:Student Ratio
          </Typography>
          <Typography variant="h3" sx={{ mt: 2 }} fontWeight="bold">
            {taStudentRatio}
          </Typography>
        </Grid>
      </Card>
    </div>
  );
}
