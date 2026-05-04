import React, { useState } from 'react';
import {
  Card,
  Divider,
  Typography,
  Grid,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
} from '@mui/material';

import { DateTime } from 'luxon';

import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useCourseId } from '../../contexts/CourseContext';

interface HelpedStudent {
  student_email: string;
  name: string;
  timeStart: string;
  timeEnd: string;
  question: string;
}

function createData(
  student_email: string,
  name: string,
  timeStart: string,
  timeEnd: string,
  question: string,
): HelpedStudent {
  const timeStartStr = DateTime.fromISO(timeStart).toFormat('MM/dd/yyyy HH:mm');
  const timeEndStr = DateTime.fromISO(timeEnd).toFormat('MM/dd/yyyy HH:mm');
  return { student_email, name, timeStart: timeStartStr, timeEnd: timeEndStr, question };
}

export default function PersonalStats() {
  const courseId = useCourseId();
  const helpedStudentsData = useQuery(api.metrics.getHelpedStudents, { courseId });
  const averageTimeData = useQuery(api.metrics.getAverageTimePerQuestion, { courseId });
  const numQuestionsData = useQuery(api.metrics.getNumQuestionsAnswered, { courseId });

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const numQuestionsAnswered = numQuestionsData ? numQuestionsData.numQuestions : 0;
  const averageHelpTime = averageTimeData ? averageTimeData.averageTime : '0:00';

  const helpedStudents = helpedStudentsData
    ? helpedStudentsData.helpedStudents.map((helpedStudent: any) =>
        createData(
          helpedStudent.student_email,
          helpedStudent.student_name,
          helpedStudent.start_date,
          helpedStudent.end_date,
          helpedStudent.question,
        ),
      )
    : [];

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  return (
    <div>
      <Typography variant="h5" sx={{ mt: 4, ml: 10 }} fontWeight="bold">
        Personal Statistics
      </Typography>
      <Card sx={{ mt: 1, mx: 10 }}>
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
              No. of Questions Answered
            </Typography>
            <Typography variant="h3" sx={{ mt: 2 }} fontWeight="bold">
              {numQuestionsAnswered}
            </Typography>
          </Grid>
          <Grid sx={{ textAlign: 'center' }}>
            <Typography variant="h6" fontWeight="bold">
              Avg. Time Spent Per Question (min)
            </Typography>
            <Typography variant="h3" sx={{ mt: 2 }} fontWeight="bold">
              {averageHelpTime}
            </Typography>
          </Grid>
          <Stack sx={{ width: '100%' }}>
            <TableContainer sx={{ height: 300 }}>
              <Table stickyHeader aria-label="sticky table">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ minWidth: 125 }}>Email</TableCell>
                    <TableCell sx={{ minWidth: 125 }}>Name</TableCell>
                    <TableCell>Question</TableCell>
                    <TableCell>Time Start</TableCell>
                    <TableCell>Time End</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {helpedStudents
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row, i) => (
                      <TableRow hover key={row.student_email + i}>
                        <TableCell sx={{ wordBreak: 'break-word' }}>{row.student_email}</TableCell>
                        <TableCell sx={{ wordBreak: 'break-word' }}>{row.name}</TableCell>
                        <TableCell sx={{ wordBreak: 'break-word' }}>{row.question}</TableCell>
                        <TableCell>{row.timeStart}</TableCell>
                        <TableCell>{row.timeEnd}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[10, 25, 100]}
              component="div"
              count={helpedStudents.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Stack>
        </Stack>
      </Card>
    </div>
  );
}
