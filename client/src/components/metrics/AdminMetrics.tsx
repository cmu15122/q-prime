import React, {useEffect, useState} from 'react';
import MetricsService from '../../services/MetricsService';
import {
  Card, Divider, Typography, Stack, Table, TableBody, TableCell,
  TableContainer, TableHead, TablePagination, TableRow,
} from '@mui/material';

export default function AdminMetrics() {
  const [rankedStudents, setRankedStudents] = useState([]);
  const [rankedTAs, setRankedTAs] = useState([]);

  // students pagination
  const [studentPage, setStudentPage] = useState(0);
  const [rowsPerStudentPage, setRowsPerStudentPage] = useState(10);
  const handleChangeStudentPage = (event, newPage) => {
    setStudentPage(newPage);
  };
  const handleChangeRowsPerStudentPage = (event) => {
    setRowsPerStudentPage(+event.target.value);
    setStudentPage(0);
  };

  // tas pagination
  const [taPage, setTAPage] = useState(0);
  const [rowsPerTAPage, setRowsPerTAPage] = useState(10);
  const handleChangeTAPage = (event, newPage) => {
    setTAPage(newPage);
  };
  const handleChangeRowsPerTAPage = (event) => {
    setRowsPerTAPage(+event.target.value);
    setTAPage(0);
  };

  useEffect(() => {
    MetricsService.getRankedStudents().then((res) => {
      setRankedStudents(res.data.rankedStudents.map((student) => {
        return {
          ...student,
          average: Math.round(student.timeHelped / student.count * 10) / 10,
        };
      }));
    });

    MetricsService.getRankedTAs().then((res) => {
      setRankedTAs(res.data.rankedTAs.map((ta) => {
        return {
          ...ta,
          average: Math.round(ta.timeHelping / ta.count * 10) / 10,
        };
      }));
    });
  }, []);

  const studentCols = [
    {id: 'student_andrew', label: 'Andrew ID', width: 25},
    {id: 'student_name', label: 'Name', width: 25},
    {id: 'count', label: 'Num Questions', width: 100},
    {id: 'badCount', label: 'Num Ask to Fix', width: 100},
    {id: 'timeHelped', label: 'Total Helping Time (min)', width: 100},
    {id: 'average', label: 'Average Helping Time (min)', width: 100},
  ];

  const taCols = [
    {id: 'ta_andrew', label: 'Andrew ID', width: 25},
    {id: 'ta_name', label: 'Name', width: 25},
    {id: 'count', label: 'Num Questions Answered', width: 100},
    {id: 'timeHelping', label: 'Total Time Helping (min)', width: 100},
    {id: 'average', label: 'Average Time Helping (min)', width: 100},
  ];

  return (
    <div style={{margin: 'auto', padding: '10px', width: '90%'}}>
      <Typography variant="h5" sx={{my: 4}} fontWeight='bold'>
        Ranked Students and Ranked TAs
      </Typography>

      <Card>
        <Stack
          direction={{xs: 'column', md: 'row'}}
          justifyContent="space-evenly"
          alignItems="start"
          divider={<Divider orientation="vertical" flexItem/>}
          spacing={2}
          sx={{m: 2}}
        >
          <Stack sx={{width: '100%'}}>
            <TableContainer sx={{height: 'auto'}}>
              <Table stickyHeader aria-label="sticky table">
                <TableHead>
                  <TableRow>
                    {studentCols.map((column) => (
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
                  {rankedStudents
                      .slice(studentPage * rowsPerStudentPage, studentPage * rowsPerStudentPage + rowsPerStudentPage)
                      .map((row) => {
                        return (
                          <TableRow hover role="checkbox" tabIndex={-1} key={row.student_andrew}>
                            {studentCols.map((column) => {
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
              count={rankedStudents.length}
              rowsPerPage={rowsPerStudentPage}
              page={studentPage}
              onPageChange={handleChangeStudentPage}
              onRowsPerPageChange={handleChangeRowsPerStudentPage}
            />
          </Stack>
          <Stack sx={{width: '100%'}}>
            <TableContainer sx={{height: 'auto'}}>
              <Table stickyHeader aria-label="sticky table">
                <TableHead>
                  <TableRow>
                    {taCols.map((column) => (
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
                  {rankedTAs
                      .slice(taPage * rowsPerTAPage, taPage * rowsPerTAPage + rowsPerTAPage)
                      .map((row) => {
                        return (
                          <TableRow hover role="checkbox" tabIndex={-1} key={row.ta_andrew}>
                            {taCols.map((column) => {
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
              count={rankedTAs.length}
              rowsPerPage={rowsPerTAPage}
              page={taPage}
              onPageChange={handleChangeTAPage}
              onRowsPerPageChange={handleChangeRowsPerTAPage}
            />
          </Stack>
        </Stack>
      </Card>
    </div>
  );
}
