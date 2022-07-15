import React, { useState, useEffect } from 'react';
import {
    styled, Button, Badge, Box, Card, CardActions, IconButton, Collapse, Divider, Stack,
    Typography, Table, TableRow, TableCell, TableBody, ToggleButton, ToggleButtonGroup
} from '@mui/material';
import {
    Edit, Delete, ExpandMore, FindInPage
} from '@mui/icons-material';
import DayPicker from './DayPicker';
import Cookies from 'universal-cookie';

const cookies = new Cookies();

const Expand = styled((props) => {
    const { expand, ...other } = props;
    return <IconButton {...other} />;
})(({ theme, expand }) => ({
    transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
    marginLeft: 'auto',
    transition: theme.transitions.create('transform', {
        duration: theme.transitions.duration.shortest,
    })
}));

export default function Locations(props) {
    const { theme, queueData } = props

    const [open, setOpen] = useState(false);

    const handleClick = () => {
        setOpen(!open);
    };
    const [rows, setRows] = useState([{room: 'GHC'}, {room: 'WEAN'}]);
    const [roomDictionary, setRoomDictionary] = useState({})

    // useEffect(() => {
    //     if (queueData != null) {
    //         updateTopics(queueData.topics);
    //     }
    // }, [queueData]);

    // const handleAdd = () => {
    //     setOpenAdd(true);
    // };

    // const handleEdit = (row) => {
    //     setOpenEdit(true);
    //     setSelectedRow(row);
    // };

    // const handleDelete = (row) => {
    //     setOpenDelete(true);
    //     setSelectedRow(row);
    // };

    // const handleClose = () => {
    //     setOpenAdd(false);
    //     setOpenEdit(false);
    //     setOpenDelete(false);
    // };

    // const updateTopics = (newTopics) => {
    //     let newRows = [];
    //     newTopics.forEach (topic => {
    //         newRows.push(createData(
    //             topic.assignment_id, 
    //             topic.name, 
    //             topic.category, 
    //             topic.start_date, 
    //             topic.end_date
    //         ));
    //     });
    //     setRows(newRows);
    // }
    const handleDaysChange = () => {
        console.log(roomDictionary)
    }

    return (
        <div className='card' style={{ display:'flex' }}>
            <Card sx={{ minWidth: '100%' }}>
                <CardActions disableSpacing style={{ cursor: 'pointer' }} onClick={handleClick}>
                    <Typography sx={{ fontSize: 16, fontWeight: 'bold', ml: 2, mt: 1 }} variant="h5" gutterBottom>
                        Location Settings
                    </Typography>
                    <Expand
                        expand={open}
                        aria-expanded={open}
                        aria-label="show more"
                        sx={{ mr: 1 }}
                    >
                        <ExpandMore />
                    </Expand>
                </CardActions>
                <Collapse in={open} timeout="auto" unmountOnExit>
                    <Divider></Divider>
                        <Table aria-label="topicsTable">
                            <TableBody>
                            {rows.map((row, index) => (
                                <TableRow
                                    key={row.room}
                                    style={ index % 2 ? { background : theme.palette.background.paper }:{ background : theme.palette.background.default }}
                                >
                                    <TableCell component="th" scope="row" sx={{ fontSize: '16px', fontWeight: 'bold', pl: 3.25 }}>
                                        {row.room}
                                    </TableCell>
                                    {/* <TableCell component="th" scope="row" sx={{ fontSize: '16px', fontStyle: 'italic', pl: 3.25 }}>
                                        <DayPicker 
                                            room={row.room}
                                            days={roomDictionary[row.room]}
                                            handleDaysChange={handleDaysChange}
                                        />
                                    </TableCell> */}
                                </TableRow>
                            ))}
                                {/* <TableRow
                                    key='add'
                                    style={{ background : theme.palette.background.default }}
                                >
                                    <TableCell align="center" colSpan={5}>
                                        <Button sx={{ mr: 1, fontWeight: 'bold', fontSize: '18px' }} color="primary" variant="contained" onClick={() => handleAdd()}>
                                            + Add Topic
                                        </Button>
                                    </TableCell>
                                </TableRow> */}
                            </TableBody>
                        </Table>
                </Collapse>
            </Card>
        </div>
    );
}
