import React, {useState} from 'react';
import {
  Card, Divider, Typography, Grid, Stack, Table, TableBody, TableCell,
  TableContainer, TableHead, TablePagination, TableRow,
} from '@mui/material';

import {DateTime} from 'luxon';

import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';

const columns = [
  {id: 'student_email', label: 'Email', width: 25},
  {id: 'name', label: 'Name', width: 25},
  {id: 'question', label: 'Question', width: 200},
  {id: 'timeStart', label: 'Time Start', width: 100},
  {id: 'timeEnd', label: 'Time End', width: 100},
];

interface HelpedStudent {
  student_email: string;
  name: string;
  timeStart: string;
  timeEnd: string;
  question: string;
  [key: string]: any;
}

function createData(student_email: string, name: string, timeStart: string, timeEnd: string, question: string): HelpedStudent {
  const timeStartStr = DateTime.fromISO(timeStart).toLocaleString(DateTime.DATETIME_MED);
  const timeEndStr = DateTime.fromISO(timeEnd).toLocaleString(DateTime.DATETIME_MED);
  return {student_email, name, timeStart: timeStartStr, timeEnd: timeEndStr, question};
}

export default function PersonalStats() {
  const helpedStudentsData = useQuery(api.metrics.getHelpedStudents);
  const averageTimeData = useQuery(api.metrics.getAverageTimePerQuestion);
  const numQuestionsData = useQuery(api.metrics.getNumQuestionsAnswered);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const numQuestionsAnswered = numQuestionsData ? numQuestionsData.numQuestions : 0;
  const averageHelpTime = averageTimeData ? averageTimeData.averageTime : 0;

  const helpedStudents = helpedStudentsData ? helpedStudentsData.helpedStudents.map((helpedStudent: any) =>
    createData(
        helpedStudent.student_email,
        helpedStudent.student_name,
        helpedStudent.start_date,
        helpedStudent.end_date,
        helpedStudent.question,
    )
  ) : [];

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  return (
    <div style={{margin: 'auto', padding: '10px', width: '90%'}}>
      <Typography variant="h5" sx={{my: 4}} fontWeight='bold'>
        Personal Statistics
      </Typography>
      <Card>
        <Stack
          direction={{xs: 'column', md: 'row'}}
          justifyContent="space-evenly"
          alignItems="center"
          divider={<Divider orientation="vertical" flexItem/>}
          spacing={2}
          sx={{m: 2}}
        >
          <Grid sx={{textAlign: 'center'}}>
            <Typography variant='h6' fontWeight='bold'>No. of Questions Answered</Typography>
            <Typography variant='h3' sx={{mt: 2}} fontWeight='bold'>{numQuestionsAnswered}</Typography>
          </Grid>
          <Grid sx={{textAlign: 'center'}}>
            <Typography variant='h6' fontWeight='bold'>Avg. Time Spent Per Question (min)</Typography>
            <Typography variant='h3' sx={{mt: 2}} fontWeight='bold'>{Number(averageHelpTime).toFixed(2)}</Typography>
          </Grid>
          <Stack sx={{width: '100%'}}>
            <TableContainer sx={{height: 300}}>
              <Table stickyHeader aria-label="sticky table">
                <TableHead>
                  <TableRow>
                    {columns.map((column) => (
                      <TableCell
                        key={column.id}
                        style={{width: column.width, textOverflow: 'ellipsis'}}
                      >
                        {column.label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {helpedStudents
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((row, i) => {
                        return (
                          <TableRow hover role="checkbox" tabIndex={-1} key={row.student_email + i}>
                            {columns.map((column) => {
                              const value = row[column.id];
                              return (
                                <TableCell key={column.id} sx={{width: 50, textOverflow: 'ellipsis'}}>
                                  {value}
                                </TableCell>
                              );
                            })}
                          </TableRow>
                        );
                      })
                  }
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
