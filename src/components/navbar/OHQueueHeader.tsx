import { Box, useTheme } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useCourseId, useCourseSlug } from '../../contexts/CourseContext';

export default function OHQueueHeader() {
  const courseId = useCourseId();
  const slug = useCourseSlug();
  const queueData = useQuery(api.home.home_get.getQueueData, { courseId });
  const theme = useTheme();

  return (
    <Box
      component={RouterLink}
      to={`/${slug}`}
      sx={{
        color: theme.palette.ink.primary,
        fontWeight: 600,
        fontSize: '1.25rem',
        textDecoration: 'none',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {queueData?.title}
    </Box>
  );
}
