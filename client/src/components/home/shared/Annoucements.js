import React, { useState, useEffect } from 'react';
import {
    Box, Button, CardActions, IconButton, Divider, Stack,
    Typography, Table, TableCell, TableBody, TableContainer
} from '@mui/material';
import {
    Edit, Delete
} from '@mui/icons-material';
import Cookies from 'universal-cookie';

import AnnouncementDialogBody from './dialogs/AnnouncementDialogBody';
import AddDialog from '../../common/dialogs/AddDialog';
import EditDialog from '../../common/dialogs/EditDialog';
import DeleteDialog from '../../common/dialogs/DeleteDialog';

import BaseCard from '../../common/cards/BaseCard';
import ItemRow from '../../common/table/ItemRow';

import HomeService from '../../../services/HomeService';
import { socketSubscribeTo } from '../../../services/SocketsService';

const cookies = new Cookies();

function createData(id, content, markedRead) {
    return { id, content, markedRead };
}

export default function Announcements(props) {
    const { theme, queueData } = props

    const [selectedRow, setSelectedRow] = useState();
    const [rows, setRows] = useState([]);

    useEffect(() => {
        socketSubscribeTo("addAnnouncement", (data) => {
            let announcement = data.announcement;
            let readCookies = cookies.get('announcements');

            let newAnnouncement = createData(
                announcement.id,
                announcement.content,
                readCookies && readCookies[announcement.id]
            );

            setRows(rows => [...rows.filter(p => p.id !== announcement.id), newAnnouncement]);
        });

        socketSubscribeTo("updateAnnouncement", (data) => {
            let id = data.updatedId;
            let announcement = data.announcement;
            
            let readCookies = cookies.get('announcements');
            if (readCookies && (id in readCookies)) {
                readCookies[id] = false;
                cookies.set('announcements', readCookies);
            }

            let newAnnouncement = createData(
                announcement.id,
                announcement.content,
                readCookies && readCookies[announcement.id]
            );

            setRows(rows => [...rows.filter(p => p.id !== id), newAnnouncement]);
        });

        socketSubscribeTo("deleteAnnouncement", (data) => {
            let id = data.deletedId;
            
            let readCookies = cookies.get('announcements');
            if (readCookies && (id in readCookies)) {
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

    const updateAnnouncements = (newAnnouncements) => {
        const readCookies = cookies.get('announcements');

        let newRows = [];
        newAnnouncements.forEach (announcement => {
            newRows.push(createData(
                announcement.id, 
                announcement.content,
                readCookies && readCookies[announcement.id]
            ));
        });
        setRows(newRows);
    }

    /** Dialog Functions */
    const [openAdd, setOpenAdd] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [content, setContent] = useState("");

    const handleAddDialog = () => {
        setOpenAdd(true);
        setContent("");
    };

    const handleEditDialog = (row) => {
        setOpenEdit(true);
        setSelectedRow(row);

        setContent(row.content);
    };

    const handleDeleteDialog = (row) => {
        setOpenDelete(true);
        setSelectedRow(row);
    };

    const handleClose = () => {
        setOpenAdd(false);
        setOpenEdit(false);
        setOpenDelete(false);
    };

    const handleAdd = event => {
        event.preventDefault();
        HomeService.createAnnouncement(
            JSON.stringify({
                content: content
            })
        ).then(() => {
            handleClose();
        });
    };

    const handleEdit = event => {
        event.preventDefault();
        HomeService.updateAnnouncement(
            JSON.stringify({
                id: selectedRow.id,
                content: content
            })
        ).then(() => {
            handleClose();
        });
    };

    const handleDelete = () => {
        HomeService.deleteAnnouncement(
            JSON.stringify({
                id: selectedRow.id,
            })
        ).then(() => {
            handleClose();
        });
    };

    /** 
     * Using cookies to mark an announcement as read
     * FIXME: Unused for now
     */
    // const handleMarkRead = () => {
    //     let readCookies = cookies.get('announcements');
    //     if (!readCookies) {
    //         readCookies = {};
    //     }

    //     readCookies[selectedRow['id']] = true;
    //     cookies.set('announcements', readCookies);

    //     selectedRow['markedRead'] = true;
    // };

    return (
        <div>
            <BaseCard>
                <CardActions style={{ justifyContent: "space-between" }}>
                    <Typography sx={{ fontWeight: 'bold', ml: 2, mt: 1 }} variant="h5" gutterBottom>
                        Announcements
                    </Typography>
                    {
                        queueData?.isTA &&
                        <Button sx={{ fontWeight: 'bold', mr: 1 }} variant="contained" onClick={handleAddDialog}>
                            + Create
                        </Button>
                    }
                </CardActions>
                <Divider></Divider>
                <TableContainer sx={{ maxHeight: "200px"}}>
                    <Table aria-label="topicsTable" sx={{overflow: "scroll" }} stickyHeader>
                        <TableBody>
                        {rows.map((row, index) => (
                            <ItemRow theme={theme} index={index} rowKey={row.id}>
                                <TableCell component="th" scope="row" sx={{ pl: 3.25}}>
                                    <Typography sx={{ fontWeight: 'bold' }}>
                                        {row.content}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Stack sx={{ mr: 2 }} direction='row' margin='auto' justifyContent='flex-end'>
                                        {
                                            queueData?.isTA && 
                                            <Box>
                                                <IconButton sx={{ mr: 1 }} color="info" onClick={() => handleEditDialog(row)}>
                                                    <Edit />
                                                </IconButton>

                                                <IconButton color="error" onClick={() => handleDeleteDialog(row)}>
                                                    <Delete />
                                                </IconButton>
                                            </Box>
                                        }
                                    </Stack>
                                </TableCell>
                            </ItemRow>
                        ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </BaseCard>

            <AddDialog
                title="Add New Announcement"
                isOpen={openAdd}
                onClose={handleClose}
                handleCreate={handleAdd}
            >
                <AnnouncementDialogBody
                    content={content}
                    setContent={setContent}
                />
            </AddDialog>

            <EditDialog
                title={"Edit Announcement"}
                isOpen={openEdit}
                onClose={handleClose}
                handleEdit={handleEdit}
            >
                <AnnouncementDialogBody
                    content={content}
                    setContent={setContent}
                />
            </EditDialog>

            <DeleteDialog
                title="Delete Announcement"
                isOpen={openDelete}
                onClose={handleClose}
                handleDelete={handleDelete}
                itemName={"this announcement"}
            />
        </div>
    );
}
