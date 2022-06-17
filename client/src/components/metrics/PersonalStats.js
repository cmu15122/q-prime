import React, { useState } from 'react';
import {
   Card, Divider, Typography, Grid, Table, TableBody, TableCell, 
   TableContainer, TableHead, TablePagination, TableRow, Paper
} from '@mui/material'

import { DateTime } from 'luxon';

const columns = [
    { id: 'andrew_id', label: 'Andrew ID', minWidth: 100 },
    { id: 'name', label: 'Name', minWidth: 100 },
    { id: 'time_start', label: 'Time Start', minWidth: 100 },
    { id: 'time_end', label: 'Time End', minWidth: 100 },
  ];
  
  function createData(andrew_id, name, time_start, time_end) {
    return { andrew_id, name, time_start, time_end };
  }
  
  const rows = [
    createData('angelaz1', 'Angela Zhang', DateTime.now().setZone('America/New_York').toLocaleString(DateTime.DATETIME_MED), DateTime.now().setZone('America/New_York').plus({ minutes: 15 }).toLocaleString(DateTime.DATETIME_MED)),
    createData('xal', 'Amanda Li', DateTime.fromISO('2022-08-29T21:00:00').toLocaleString(DateTime.DATETIME_MED), DateTime.fromISO('2022-08-29T21:00:00').toLocaleString(DateTime.DATETIME_MED)),
    createData('lbzhou', 'Lora Zhou', DateTime.fromISO('2022-08-29T21:00:00').toLocaleString(DateTime.DATETIME_MED), DateTime.fromISO('2022-08-29T21:00:00').toLocaleString(DateTime.DATETIME_MED)),
    createData('test', 'Test', '1', '2'),
    createData('test', 'Test', '1', '2'),
    createData('test', 'Test', '1', '2'),
    createData('test', 'Test', '1', '2'),
    createData('test', 'Test', '1', '2'),
    createData('test', 'Test', '1', '2'),
    createData('test', 'Test', '1', '2'),
    createData('test', 'Test', '1', '2'),
    createData('test', 'Test', '1', '2'),
    createData('test', 'Test', '1', '2'),
    createData('test', 'Test', '1', '2'),
    createData('test', 'Test', '1', '2'),
    createData('test', 'Test', '1', '2'),
    createData('test', 'Test', '1', '2'),
    createData('test', 'Test', '1', '2'),
    createData('test', 'Test', '1', '2'),
    createData('test', 'Test', '1', '2'),
    createData('test', 'Test', '1', '2'),
  ];

export default function PersonalStats(props) {
    const { theme } = props;

    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);

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
                OH Session Statistics
            </Typography>
            <Card
                sx={{
                display: 'flex',
                alignItems: 'center',
                maxWidth: '100%',
                border: (theme) => `1px solid ${theme.palette.divider}`,
                borderRadius: 1,
                mt: 4,
                mx: 13,
                }}
            >
                <Grid sx={{ px: 4, py: 4, alignItems: 'center', textAlign: 'center' }}>
                    <Typography variant='h6' wrap fontWeight='bold'>No. of Questions Answered</Typography>
                    <Typography variant='h3' wrap sx={{ mt: 2 }} fontWeight='bold'>8</Typography>
                </Grid>
                <Divider orientation="vertical" variant="middle" flexItem />
                <Grid sx={{ px: 4, py: 4, alignItems: 'center', textAlign: 'center' }}>
                    <Typography variant='h6' wrap fontWeight='bold'>Time Spent Per Question</Typography>
                    <Typography variant='h3' wrap sx={{ mt: 2 }} fontWeight='bold'>15</Typography>
                </Grid>
                <Divider orientation="vertical" flexItem />
                <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                    <TableContainer sx={{ maxHeight: 220 }}>
                        <Table stickyHeader aria-label="sticky table">
                        <TableHead>
                            <TableRow>
                            {columns.map((column) => (
                                <TableCell
                                key={column.id}
                                align={column.align}
                                style={{ minWidth: column.minWidth }}
                                >
                                {column.label}
                                </TableCell>
                            ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((row) => {
                                return (
                                <TableRow hover role="checkbox" tabIndex={-1} key={row.code}>
                                    {columns.map((column) => {
                                    const value = row[column.id];
                                    return (
                                        <TableCell key={column.id} align={column.align}>
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
                        count={rows.length}
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