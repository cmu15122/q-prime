
import React, { useState, useEffect } from 'react';
import {
    styled, Button, Card, CardActions, IconButton, Collapse, Divider,
    Typography, Table, TableRow, TableCell, TableBody
} from '@mui/material';
import {
    Edit, Delete, ExpandMore
} from '@mui/icons-material';

import AddTopicDialog from './dialogs/AddTopicDialog';
import EditTopicDialog from './dialogs/EditTopicDialog';
import DeleteTopicDialog from './dialogs/DeleteTopicDialog';

import { DateTime } from 'luxon';

const Expand = styled((props) => {
        const { expand, ...other } = props;
        return <IconButton {...other} />;
    })(({ theme, expand }) => ({
        transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
        marginLeft: 'auto',
        transition: theme.transitions.create('transform', {
            duration: theme.transitions.duration.shortest,  
        }),
    })
);

function createData(name, category, dateIn, dateOut) {
    dateIn = DateTime.fromISO(dateIn);
    dateOut = DateTime.fromISO(dateOut);
    return { name, category, dateIn, dateOut };
}

export default function QueueTopicSettings(props) {
    const { theme, queueData } = props

    const [open, setOpen] = useState(false);

    const handleClick = () => {
        setOpen(!open);
    };

    const [openAdd, setOpenAdd] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [selectedRow, setSelectedRow] = useState();
    const [rows, setRows] = useState([]);

    useEffect(() => {
        if (queueData != null) {
            let newRows = [];
            queueData.topics.forEach (topic => {
                newRows.push(createData(topic.assignment.name, topic.assignment.category, topic.start_date, topic.end_date))
            });
            setRows(newRows);
        }
    }, [queueData]);

    const handleAdd = () => {
        setOpenAdd(true);
    };

    const handleEdit = (row) => {
        setOpenEdit(true);
        setSelectedRow(row);
    };

    const handleDelete = (row) => {
        setOpenDelete(true);
        setSelectedRow(row);
    };

    const handleClose = () => {
        setOpenAdd(false);
        setOpenEdit(false);
        setOpenDelete(false);
    };

    return (
        <div className='card' style={{ display:'flex' }}>
            <Card sx={{ minWidth: '100%' }}>
                <CardActions disableSpacing style={{ cursor: 'pointer' }} onClick={handleClick}>
                    <Typography sx={{ fontSize: 16, fontWeight: 'bold', ml: 2, mt: 1 }} variant="h5" gutterBottom>
                        Queue Topic Settings
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
                                    key={row.name}
                                    style={ index % 2 ? { background : theme.palette.background.paper }:{ background : theme.palette.background.default }}
                                >
                                    <TableCell component="th" scope="row" sx={{ fontSize: '16px', fontWeight: 'bold', pl: 3.25 }}>
                                        {row.name}
                                    </TableCell>
                                    <TableCell component="th" scope="row" sx={{ fontSize: '16px', fontStyle: 'italic', pl: 3.25 }}>
                                        {row.category}
                                    </TableCell>
                                    <TableCell align="left" sx={{ fontSize: '16px' }}>{row.dateIn.toLocaleString(DateTime.DATETIME_SHORT)}</TableCell>
                                    <TableCell align="left" sx={{ fontSize: '16px' }}>{row.dateOut.toLocaleString(DateTime.DATETIME_SHORT)}</TableCell>
                                    <TableCell align="right" sx={{ pr: 3 }}>
                                        <IconButton sx={{ mr: 1 }} color="info" onClick={() => handleEdit(row)}>
                                            <Edit />
                                        </IconButton>

                                        <IconButton color="error" onClick={() => handleDelete(row)}>
                                            <Delete />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                                <TableRow
                                    key='add'
                                    style={{ background : theme.palette.background.default }}
                                >
                                    <TableCell align="center" colSpan={5}>
                                        <Button sx={{ mr: 1, fontWeight: 'bold', fontSize: '18px' }} color="primary" variant="contained" onClick={() => handleAdd()}>
                                            + Add Topic
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                </Collapse>
            </Card>
            <AddTopicDialog
                isOpen={openAdd}
                onClose={handleClose}
            />

            <EditTopicDialog
                isOpen={openEdit}
                onClose={handleClose}
                topicInfo={selectedRow}
            />

            <DeleteTopicDialog
                isOpen={openDelete}
                onClose={handleClose}
                topicInfo={selectedRow}
            />
        </div>
    );
}
