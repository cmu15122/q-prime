import { Typography } from '@mui/material';

import PersonalStats from './PersonalStats';
import OverallStats from './OverallStats';
import CumulativeStats from './CumulativeStats';
import Graph from './Graph';
import AdminMetrics from './AdminMetrics';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useCourseId } from '../../contexts/CourseContext';

export default function MetricsMain() {
  const courseId = useCourseId();
  const userData = useQuery(api.home.home_get.getUserData, { courseId });
  const isAdmin = userData?.ta_data?.is_admin ?? false;

  return (
    <div>
      <Typography variant="h3" textAlign="center" sx={{ mt: 4 }} fontWeight="bold">
        Metrics
      </Typography>
      <PersonalStats />

      <OverallStats />
      <CumulativeStats />
      <Graph />

      {isAdmin && <AdminMetrics />}
    </div>
  );
}
