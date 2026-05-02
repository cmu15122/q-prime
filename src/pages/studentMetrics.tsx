import React, { useState, Component, ReactNode } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import {
  CircularProgress,
  Typography,
  Card,
  Divider,
  Grid,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Chip,
  Button,
  Link as MuiLink,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { DateTime } from 'luxon';

import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import Navbar from '../components/navbar/Navbar';
import { useCourseId, useCourseSlug } from '../contexts/CourseContext';

/**
 * Error boundary that redirects to home on any error
 */
class MetricsErrorBoundary extends Component<
  { children: ReactNode; slug: string },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; slug: string }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  override render() {
    if (this.state.hasError) {
      return <Navigate to={`/${this.props.slug}`} />;
    }
    return this.props.children;
  }
}

/**
 * Student Metrics page - shows complete question history for a specific student
 * Only accessible to Admin TAs
 */
function StudentMetricsContent() {
  const theme = useTheme();
  const { id } = useParams<{ id: string }>();
  const courseId = useCourseId();
  const slug = useCourseSlug();
  const userData = useQuery(api.home.home_get.getUserData, { courseId });

  const isLoadingUserData = userData === undefined;
  const isAuthenticated = userData !== null && userData !== undefined;
  const isTA = isAuthenticated && userData.user_kind === 'TA';
  const isAdmin = isTA && userData.ta_data?.is_admin;

  // Only query when we've confirmed the user is an admin
  const studentHistory = useQuery(
    api.metrics.getStudentQuestionHistory,
    id && isAdmin ? { courseId, studentId: id as Id<'students'> } : 'skip',
  );

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  // Format datetime for display
  const formatDateTime = (isoString: string) => {
    return DateTime.fromISO(isoString).toFormat('MM/dd/yyyy HH:mm');
  };

  // Show loading while checking auth or waiting for data
  if (isLoadingUserData) {
    return <CircularProgress />;
  }

  // Redirect if not authorized
  if (!isAuthenticated || !isAdmin) {
    return <Navigate to={`/${slug}`} />;
  }

  // Show loading while fetching student data
  if (studentHistory === undefined) {
    return <CircularProgress />;
  }

  // Redirect if student not found
  if (studentHistory === null) {
    return <Navigate to={`/${slug}`} />;
  }

  return (
    <div
      className="StudentMetrics"
      style={{ backgroundColor: theme.palette.background.default, minHeight: '100vh' }}
    >
      <Navbar isHome={false} />
      <div style={{ margin: 'auto', padding: '10px', width: '90%' }}>
        <Button
          component={Link}
          to={`/${slug}/metrics`}
          startIcon={<ArrowBackIcon />}
          sx={{ mt: 2, mb: 1 }}
        >
          Back to Metrics
        </Button>

        <Typography variant="h5" sx={{ my: 2 }} fontWeight="bold">
          Question History: {studentHistory.studentName}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {studentHistory.studentEmail}
        </Typography>

        {/* Summary Stats */}
        <Card sx={{ mb: 4 }}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            justifyContent="space-evenly"
            alignItems="center"
            divider={<Divider orientation="vertical" flexItem />}
            spacing={2}
            sx={{ m: 2 }}
          >
            <Grid sx={{ textAlign: 'center' }}>
              <Typography variant="h6" fontWeight="bold">
                Total Questions
              </Typography>
              <Typography variant="h3" sx={{ mt: 2 }} fontWeight="bold">
                {studentHistory.totalQuestions}
              </Typography>
            </Grid>
            <Grid sx={{ textAlign: 'center' }}>
              <Typography variant="h6" fontWeight="bold">
                Questions Helped
              </Typography>
              <Typography variant="h3" sx={{ mt: 2 }} fontWeight="bold">
                {studentHistory.totalHelpedQuestions}
              </Typography>
            </Grid>
            <Grid sx={{ textAlign: 'center' }}>
              <Typography variant="h6" fontWeight="bold">
                Total Asked to Fix
              </Typography>
              <Typography variant="h3" sx={{ mt: 2 }} fontWeight="bold">
                {studentHistory.totalAskedToFix}
              </Typography>
            </Grid>
            <Grid sx={{ textAlign: 'center' }}>
              <Typography variant="h6" fontWeight="bold">
                Total Time Helped
              </Typography>
              <Typography variant="h3" sx={{ mt: 2 }} fontWeight="bold">
                {studentHistory.totalTimeHelped}
              </Typography>
            </Grid>
          </Stack>
        </Card>

        {/* Question History Table */}
        <Card>
          <Typography variant="h6" sx={{ m: 2 }} fontWeight="bold">
            All Questions ({studentHistory.questions.length})
          </Typography>
          <TableContainer sx={{ maxHeight: 600 }}>
            <Table stickyHeader aria-label="question history table">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ minWidth: 150 }}>Date/Time</TableCell>
                  <TableCell sx={{ minWidth: 120 }}>Assignment</TableCell>
                  <TableCell sx={{ minWidth: 200 }}>Question</TableCell>
                  <TableCell sx={{ minWidth: 100 }}>Location</TableCell>
                  <TableCell sx={{ minWidth: 100 }}>Status</TableCell>
                  <TableCell sx={{ minWidth: 80 }}>Wait (min)</TableCell>
                  <TableCell sx={{ minWidth: 80 }}>Help (min)</TableCell>
                  <TableCell sx={{ minWidth: 80 }}>Ask to Fix</TableCell>
                  <TableCell sx={{ minWidth: 120 }}>Helped By</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {studentHistory.questions
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row, i) => (
                    <TableRow hover key={`${row.entry_time}-${i}`}>
                      <TableCell>{formatDateTime(row.entry_time)}</TableCell>
                      <TableCell sx={{ wordBreak: 'break-word' }}>{row.assignment_name}</TableCell>
                      <TableCell sx={{ wordBreak: 'break-word' }}>{row.question}</TableCell>
                      <TableCell sx={{ wordBreak: 'break-word' }}>{row.location}</TableCell>
                      <TableCell>
                        <Chip
                          label={row.finished_by === 'helped' ? 'Helped' : 'Removed'}
                          color={row.finished_by === 'helped' ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{row.wait_time_mins}</TableCell>
                      <TableCell>{row.help_duration_mins}</TableCell>
                      <TableCell>{row.num_asked_to_fix}</TableCell>
                      <TableCell sx={{ wordBreak: 'break-word' }}>
                        {row.ta_id ? (
                          <MuiLink
                            component={Link}
                            to={`/${slug}/metrics/ta/${row.ta_id}`}
                            sx={{
                              textDecoration: 'none',
                              '&:hover': { textDecoration: 'underline' },
                            }}
                          >
                            {row.ta_name}
                          </MuiLink>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[10, 25, 50, 100]}
            component="div"
            count={studentHistory.questions.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>
      </div>
    </div>
  );
}

function StudentMetrics() {
  const slug = useCourseSlug();
  return (
    <MetricsErrorBoundary slug={slug}>
      <StudentMetricsContent />
    </MetricsErrorBoundary>
  );
}

export default StudentMetrics;
