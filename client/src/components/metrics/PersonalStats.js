import React, { useState, useEffect } from 'react';
import {
   Card, Divider, Typography, Grid, Table, TableBody, TableCell, 
   TableContainer, TableHead, TablePagination, TableRow, Paper
} from '@mui/material'

import { DateTime } from 'luxon';

import MetricsService from '../../services/MetricsService';

const columns = [
    { id: 'andrew_id', label: 'Andrew ID', width: 50 },
    { id: 'name', label: 'Name', width: 75 },
    { id: 'time_start', label: 'Time Start', width: 100 },
    { id: 'time_end', label: 'Time End', width: 100 },
];
  
function createData(andrew_id, name, time_start, time_end) {
    time_start = DateTime.fromISO(time_start).toLocaleString(DateTime.DATETIME_MED);
    time_end = DateTime.fromISO(time_end).toLocaleString(DateTime.DATETIME_MED);
    return { andrew_id, name, time_start, time_end };
}

export default function PersonalStats(props) {
    const [helpedStudents, setHelpedStudents] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const [numQuestionsAnswered, setNumQuestionsAnswered] = useState(0);
    const [averageHelpTime, setAverageHelpTime] = useState(0);

    useEffect(() =>  {
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
        let newRows = [];
        newHelpedStudents.forEach (helpedStudent => {
            newRows.push(createData(
                helpedStudent.student_andrew, 
                helpedStudent.student_name,
                helpedStudent.start_date,
                helpedStudent.end_date,
            ));
        });
        setHelpedStudents(newRows);
    }

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    return (
        <div>
            <Typography variant="h5" sx={{ mt: 4, ml: 10 }} fontWeight='bold'>
                Personal Statistics
            </Typography>
            <Card sx={{
                    display: 'flex',
                    alignItems: 'center',
                    maxWidth: '100%',
                    border: (theme) => `1px solid ${theme.palette.divider}`,
                    borderRadius: 1,
                    mt: 4,
                    mx: 13,
                    overflow: 'hidden'
            }}>
                <Grid sx={{ px: 4, py: 4, alignItems: 'center', textAlign: 'center' }}>
                    <Typography variant='h6' wrap fontWeight='bold'>No. of Questions Answered</Typography>
                    <Typography variant='h3' wrap sx={{ mt: 2 }} fontWeight='bold'>{numQuestionsAnswered}</Typography>
                </Grid>
                <Divider orientation="vertical" variant="middle" flexItem />
                <Grid sx={{ px: 4, py: 4, alignItems: 'center', textAlign: 'center' }}>
                    <Typography variant='h6' wrap fontWeight='bold'>Average Time Spent Per Question (min)</Typography>
                    <Typography variant='h3' wrap sx={{ mt: 2 }} fontWeight='bold'>{Number(averageHelpTime).toFixed(2)}</Typography>
                </Grid>
                <Divider orientation="vertical" flexItem />
                <Paper sx={{ width: '100%' }}>
                    <TableContainer sx={{ height: 220 }}>
                        <Table stickyHeader aria-label="sticky table">
                        <TableHead>
                            <TableRow>
                            {
                                columns.map((column) => (
                                    <TableCell
                                        key={column.id}
                                        align={column.align}
                                        style={{ width: column.width, textOverflow: 'ellipsis' }}
                                    >
                                        {column.label}
                                    </TableCell>
                                ))
                            }
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {helpedStudents
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((row) => {
                                    return (
                                    <TableRow hover role="checkbox" tabIndex={-1} key={row.code}>
                                        {
                                            columns.map((column) => {
                                            const value = row[column.id];
                                            return (
                                                <TableCell key={column.id} align={column.align} sx={{ width: 50, textOverflow: 'ellipsis' }}>
                                                {column.format && typeof value === 'number'
                                                    ? column.format(value)
                                                    : value}
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
                        count={helpedStudents.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </Paper>
            </Card>
        </div>
    );
}