import React, { useState, useEffect } from 'react';
import {
    styled, Button, Badge, Box, Card, CardActions, IconButton, Collapse, Divider, Stack,
    Typography, Table, TableRow, TableCell, TableBody, TableContainer, TableHead
} from '@mui/material';
import {
    Edit, Delete, ExpandMore, FindInPage
} from '@mui/icons-material';
import Cookies from 'universal-cookie';

import OpenAnnouncement from './dialogs/OpenAnnouncement';
import AddAnnouncement from './dialogs/AddAnnouncement';
import EditAnnouncement from './dialogs/EditAnnouncement';
import DeleteAnnouncement from './dialogs/DeleteAnnouncement';

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
                <CardActions disableSpacing onClick={handleClick} style={{ cursor: 'pointer' }}>
                    <Typography sx={{ fontSize: 20, fontWeight: 'bold', ml: 2, mt: 1 }} variant="h5" gutterBottom>
                        Announcements
                    </Typography>
                </CardActions>
                {/* <Collapse in={open} timeout="auto" unmountOnExit> */}
                    <Divider></Divider>
                        <TableContainer sx={{ maxHeight: "200px"}}>
                            <Table aria-label="topicsTxable" sx={{overflow: "scroll" }} stickyHeader>
                                <TableBody>
                                {rows.map((row, index) => (
                                    <TableRow
                                        key={row.header}
                                        style={ index % 2 ? { background : theme?.palette?.background.paper }:{ background : theme?.palette?.background.default }}
                                    >
                                        <TableCell component="th" scope="row" sx={{ fontSize: '16px', fontWeight: 'bold', pl: 3.25 }}>
                                            {row.content}
                                        </TableCell>
                                        <TableCell scope="row">
                                            <Stack sx={{ mr: 2 }}direction='row' margin='auto' justifyContent='flex-end'>
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
                {/* </Collapse> */}
            </Card>
            {
                queueData?.isTA &&
                <Card
                    sx={{ background : theme?.palette?.background.default }}
                >
                    <Button sx={{ mr: 1, fontWeight: 'bold', fontSize: '18px' }} color="primary" variant="contained" onClick={() => handleAdd()}>
                        + Create
                    </Button>
                </Card>
            }
            
            <OpenAnnouncement 
                isOpen={openAnnouncement}
                announcementInfo={selectedRow}
                onClose={handleClose}
                onMarkRead={handleMarkRead}
            />

            <AddAnnouncement
                isOpen={openAdd}
                onClose={handleClose}
                updateAnnouncements={updateAnnouncements}
            />

            <EditAnnouncement
                isOpen={openEdit}
                onClose={handleClose}
                announcementInfo={selectedRow}
                updateAnnouncements={updateAnnouncements}
            />

            <DeleteAnnouncement
                isOpen={openDelete}
                onClose={handleClose}
                announcementInfo={selectedRow}
                updateAnnouncements={updateAnnouncements}
            />
        </div>
    );
}
