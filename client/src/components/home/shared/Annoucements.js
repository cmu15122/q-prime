import React, { useState, useEffect } from 'react';
import {
    Box, Button, Card, CardActions, IconButton, Divider, Stack,
    Typography, Table, TableRow, TableCell, TableBody, TableContainer
} from '@mui/material';
import {
    Edit, Delete
} from '@mui/icons-material';
import Cookies from 'universal-cookie';

import OpenAnnouncement from './dialogs/OpenAnnouncement';
import AddAnnouncement from './dialogs/AddAnnouncement';
import EditAnnouncement from './dialogs/EditAnnouncement';
import DeleteAnnouncement from './dialogs/DeleteAnnouncement';

import { socketSubscribeTo } from '../../../services/SocketsService';

const cookies = new Cookies();

function createData(id, header, content, markedRead) {
    return { id, header, content, markedRead };
}

export default function Announcements(props) {
    const { theme, queueData, setAllRead } = props

    const [open, setOpen] = useState(false);

    const handleClick = () => {
        setOpen(!open);
    };

    const [openAnnouncement, setOpenAnnouncement] = useState(false);
    const [openAdd, setOpenAdd] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [selectedRow, setSelectedRow] = useState();
    const [rows, setRows] = useState([]);

    useEffect(() => {
        socketSubscribeTo("addAnnouncement", (data) => {
            let announcement = data.announcement;
            let readCookies = cookies.get('announcements');

            let newAnnouncement = createData(
                announcement.id, 
                announcement.header, 
                announcement.content,
                readCookies && readCookies[announcement.id]
            );

            setRows(rows => [...rows, newAnnouncement]);
        });

        socketSubscribeTo("updateAnnouncement", (data) => {
            let id = data.updatedId;
            let announcement = data.announcement;
            
            let readCookies = cookies.get('announcements');
            if (readCookies && readCookies.hasOwn(id)) {
                readCookies[id] = false;
                cookies.set('announcements', readCookies);
            }

            let newAnnouncement = createData(
                announcement.id, 
                announcement.header, 
                announcement.content,
                readCookies && readCookies[announcement.id]
            );

            setRows(rows => [...rows.filter(p => p.id !== id), newAnnouncement]);
        });

        socketSubscribeTo("deleteAnnouncement", (data) => {
            let id = data.deletedId;
            
            let readCookies = cookies.get('announcements');
            if (readCookies && readCookies.hasOwn(id)) {
                readCookies[id] = false;
                cookies.set('announcements', readCookies);
            }

            setRows(rows => [...rows.filter(p => p.id !== id)]);
        });
    }, []);

    useEffect(() => {
        if (queueData != null) {
            updateAnnouncements(queueData.announcements);
        }
    }, [queueData]);

    const handleOpenAnnouncement = (row) => {
        setOpenAnnouncement(true);
        setSelectedRow(row);
    }

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
        setOpenAnnouncement(false);
        setOpenAdd(false);
        setOpenEdit(false);
        setOpenDelete(false);
    };

    const handleMarkRead = () => {
        let readCookies = cookies.get('announcements');
        if (!readCookies) {
            readCookies = {};
        }

        readCookies[selectedRow['id']] = true;
        cookies.set('announcements', readCookies);

        selectedRow['markedRead'] = true;
        setOpenAnnouncement(false);
    };

    const updateAnnouncements = (newAnnouncements) => {
        const readCookies = cookies.get('announcements');

        let newRows = [];
        newAnnouncements.forEach (announcement => {
            newRows.push(createData(
                announcement.id, 
                announcement.header, 
                announcement.content,
                readCookies && readCookies[announcement.id]
            ));
        });
        setRows(newRows);
    }

    return (
        <div className='card' style={{ display:'flex' }}>
            <Card sx={{ minWidth: '100%' }}>
                <CardActions onClick={handleClick} style={{ justifyContent: "space-between" }}>
                    <Typography sx={{ fontSize: 20, fontWeight: 'bold', ml: 2, mt: 1 }} variant="h5" gutterBottom>
                        Announcements
                    </Typography>
                    {
                        queueData?.isTA &&
                        <Button sx={{ mr: 1, fontWeight: 'bold', fontSize: '15px' }} variant="contained" onClick={() => handleAdd()}>
                            + Create
                        </Button>
                    }
                </CardActions>
                <Divider></Divider>
                <TableContainer sx={{ maxHeight: "200px"}}>
                    <Table aria-label="topicsTable" sx={{overflow: "scroll" }} stickyHeader>
                        <TableBody>
                        {rows.map((row, index) => (
                            <TableRow
                                key={row.id}
                                style={ index % 2 ? { background : theme?.palette?.background.paper }:{ background : theme?.palette?.background.default }}
                            >
                                <TableCell component="th" scope="row" sx={{ fontSize: '16px', fontWeight: 'bold', pl: 3.25}}>
                                    {row.content}
                                </TableCell>
                                <TableCell>
                                    <Stack sx={{ mr: 2 }} direction='row' margin='auto' justifyContent='flex-end'>
                                        {
                                            queueData?.isTA && 
                                            <Box>
                                                <IconButton sx={{ mr: 1 }} color="info" onClick={() => handleEdit(row)}>
                                                    <Edit />
                                                </IconButton>

                                                <IconButton color="error" onClick={() => handleDelete(row)}>
                                                    <Delete />
                                                </IconButton>
                                            </Box>
                                        }
                                    </Stack>
                                </TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Card>
            
            <OpenAnnouncement 
                isOpen={openAnnouncement}
                announcementInfo={selectedRow}
                onClose={handleClose}
                onMarkRead={handleMarkRead}
            />

            <AddAnnouncement
                isOpen={openAdd}
                onClose={handleClose}
            />

            <EditAnnouncement
                isOpen={openEdit}
                onClose={handleClose}
                announcementInfo={selectedRow}
            />

            <DeleteAnnouncement
                isOpen={openDelete}
                onClose={handleClose}
                announcementInfo={selectedRow}
            />
        </div>
    );
}
