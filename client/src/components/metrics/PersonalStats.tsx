import React, {useState, useEffect} from 'react';
import {
  Card, Divider, Typography, Grid, Stack, Table, TableBody, TableCell,
  TableContainer, TableHead, TablePagination, TableRow,
} from '@mui/material';

import {DateTime} from 'luxon';

import MetricsService from '../../services/MetricsService';

const columns = [
  {id: 'andrewId', label: 'Andrew ID', width: 25},
  {id: 'name', label: 'Name', width: 25},
  {id: 'question', label: 'Question', width: 200},
  {id: 'timeStart', label: 'Time Start', width: 100},
  {id: 'timeEnd', label: 'Time End', width: 100},
];

function createData(andrewId, name, timeStart, timeEnd, question) {
  timeStart = DateTime.fromISO(timeStart).toLocaleString(DateTime.DATETIME_MED);
  timeEnd = DateTime.fromISO(timeEnd).toLocaleString(DateTime.DATETIME_MED);
  return {andrewId, name, timeStart, timeEnd, question};
}

export default function PersonalStats() {
  const [helpedStudents, setHelpedStudents] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [numQuestionsAnswered, setNumQuestionsAnswered] = useState(0);
  const [averageHelpTime, setAverageHelpTime] = useState(0);

  useEffect(() => {
    MetricsService.getHelpedStudents().then((res) => {
      updateHelpedStudents(res.data.helpedStudents);
    });

    MetricsService.getAverageTimePerQuestion().then((res) => {
      setAverageHelpTime(res.data.averageTime);
    });

    MetricsService.getNumQuestionsAnswered().then((res) => {
      setNumQuestionsAnswered(res.data.numQuestions);
    });
  }, []);

  const updateHelpedStudents = (newHelpedStudents) => {
    const newRows = [];
    newHelpedStudents.forEach((helpedStudent) => {
      newRows.push(createData(
          helpedStudent.student_andrew,
          helpedStudent.student_name,
          helpedStudent.start_date,
          helpedStudent.end_date,
          helpedStudent.question,
      ));
    });
    setHelpedStudents(newRows);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
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
                          <TableRow hover role="checkbox" tabIndex={-1} key={row.andrewId + i}>
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
