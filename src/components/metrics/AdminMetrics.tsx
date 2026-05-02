import React, { useState } from 'react';
import {
  Card,
  Divider,
  Typography,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Link as MuiLink,
} from '@mui/material';
import { Link } from 'react-router-dom';

import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useCourseId, useCourseSlug } from '../../contexts/CourseContext';

export default function AdminMetrics() {
  const courseId = useCourseId();
  const slug = useCourseSlug();
  const rankedStudentsData = useQuery(api.metrics.getRankedStudents, { courseId });
  const rankedTAsData = useQuery(api.metrics.getRankedTAs, { courseId });

  const [studentPage, setStudentPage] = useState(0);
  const [rowsPerStudentPage, setRowsPerStudentPage] = useState(10);
  const handleChangeStudentPage = (_event: unknown, newPage: number) => {
    setStudentPage(newPage);
  };
  const handleChangeRowsPerStudentPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerStudentPage(+event.target.value);
    setStudentPage(0);
  };

  // tas pagination
  const [taPage, setTAPage] = useState(0);
  const [rowsPerTAPage, setRowsPerTAPage] = useState(10);
  const handleChangeTAPage = (_event: unknown, newPage: number) => {
    setTAPage(newPage);
  };
  const handleChangeRowsPerTAPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerTAPage(+event.target.value);
    setTAPage(0);
  };

  const rankedStudents = rankedStudentsData
    ? rankedStudentsData.rankedStudents.map((student) => {
        return {
          ...student,
          average:
            student.count > 0 ? Math.round((student.timeHelped / student.count) * 10) / 10 : 0,
        };
      })
    : [];

  const rankedTAs = rankedTAsData
    ? rankedTAsData.rankedTAs.map((ta) => {
        return {
          ...ta,
          average: ta.count > 0 ? Math.round((ta.timeHelping / ta.count) * 10) / 10 : 0,
        };
      })
    : [];

  const studentCols = [
    { id: 'student_email', label: 'Email', width: 25 },
    { id: 'student_name', label: 'Name', width: 25 },
    { id: 'count', label: 'Num Questions', width: 100 },
    { id: 'badCount', label: 'Num Ask to Fix', width: 100 },
    { id: 'timeHelped', label: 'Total Helping Time (min)', width: 100 },
    { id: 'average', label: 'Average Helping Time (min)', width: 100 },
  ];

  const taCols = [
    { id: 'ta_email', label: 'Email', width: 25 },
    { id: 'ta_name', label: 'Name', width: 25 },
    { id: 'count', label: 'Num Questions Answered', width: 100 },
    { id: 'timeHelping', label: 'Total Time Helping (min)', width: 100 },
    { id: 'average', label: 'Average Time Helping (min)', width: 100 },
  ];

  return (
    <div style={{ margin: 'auto', padding: '10px', width: '90%' }}>
      <Typography variant="h5" sx={{ my: 4 }} fontWeight="bold">
        Ranked Students and Ranked TAs
      </Typography>

      <Card>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-evenly"
          alignItems="start"
          divider={<Divider orientation="vertical" flexItem />}
          spacing={2}
          sx={{ m: 2 }}
        >
          <Stack sx={{ width: '100%' }}>
            <TableContainer sx={{ height: 'auto' }}>
              <Table stickyHeader aria-label="sticky table">
                <TableHead>
                  <TableRow>
                    {studentCols.map((column) => (
                      <TableCell
                        key={column.id}
                        style={{ width: column.width, textOverflow: 'ellipsis' }}
                      >
                        {column.label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rankedStudents
                    .slice(
                      studentPage * rowsPerStudentPage,
                      studentPage * rowsPerStudentPage + rowsPerStudentPage,
                    )
                    .map((row) => {
                      return (
                        <TableRow hover role="checkbox" tabIndex={-1} key={row.student_email}>
                          {studentCols.map((column) => {
                            const value = row[column.id];
                            const isClickable =
                              column.id === 'student_email' || column.id === 'student_name';
                            return (
                              <TableCell
                                key={column.id}
                                sx={{ width: 50, textOverflow: 'ellipsis' }}
                              >
                                {isClickable ? (
                                  <MuiLink
                                    component={Link}
                                    to={`/${slug}/metrics/student/${row.student_id}`}
                                    sx={{
                                      textDecoration: 'none',
                                      '&:hover': { textDecoration: 'underline' },
                                    }}
                                  >
                                    {value}
                                  </MuiLink>
                                ) : (
                                  value
                                )}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      );
                    })}
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
          <Stack sx={{ width: '100%' }}>
            <TableContainer sx={{ height: 'auto' }}>
              <Table stickyHeader aria-label="sticky table">
                <TableHead>
                  <TableRow>
                    {taCols.map((column) => (
                      <TableCell
                        key={column.id}
                        style={{ width: column.width, textOverflow: 'ellipsis' }}
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
                        <TableRow hover role="checkbox" tabIndex={-1} key={row.ta_email}>
                          {taCols.map((column) => {
                            const value = row[column.id];
                            const isClickable = column.id === 'ta_email' || column.id === 'ta_name';
                            return (
                              <TableCell
                                key={column.id}
                                sx={{ width: 50, textOverflow: 'ellipsis' }}
                              >
                                {isClickable ? (
                                  <MuiLink
                                    component={Link}
                                    to={`/${slug}/metrics/ta/${row.ta_id}`}
                                    sx={{
                                      textDecoration: 'none',
                                      '&:hover': { textDecoration: 'underline' },
                                    }}
                                  >
                                    {value}
                                  </MuiLink>
                                ) : (
                                  value
                                )}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      );
                    })}
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
