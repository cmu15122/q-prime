import React, {useState, useEffect, useContext} from 'react';
import {
  Box, Button, CardActions, IconButton, Divider, Stack,
  Typography, Table, TableCell, TableBody, TableContainer,
} from '@mui/material';
import {
  Edit, Delete,
} from '@mui/icons-material';

import AnnouncementDialogBody from './dialogs/AnnouncementDialogBody';
import AddDialog from '../../common/dialogs/AddDialog';
import EditDialog from '../../common/dialogs/EditDialog';
import DeleteDialog from '../../common/dialogs/DeleteDialog';

import BaseCard from '../../common/cards/BaseCard';
import ItemRow from '../../common/table/ItemRow';

import HomeService from '../../../services/HomeService';
import {UserDataContext} from '../../../contexts/UserDataContext';
import {QueueDataContext} from '../../../contexts/QueueDataContext';

function createData(id, content) {
  return {id, content};
}

export default function Announcements(props) {
  const {queueData} = useContext(QueueDataContext);
  const {userData} = useContext(UserDataContext);

  const [selectedRow, setSelectedRow] = useState(null);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    if (queueData != null && queueData.announcements != null) {
      updateAnnouncements(queueData.announcements);
    }
  }, [queueData.announcements]);

  const updateAnnouncements = (newAnnouncements) => {
    const newRows = [];
    newAnnouncements.forEach((announcement) => {
      newRows.push(createData(
          announcement.id,
          announcement.content,
      ));
    });
    setRows(newRows);
  };

  /** Dialog Functions */
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [content, setContent] = useState('');

  const handleAddDialog = () => {
    setOpenAdd(true);
    setContent('');
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

  const handleAdd = (event) => {
    event.preventDefault();
    HomeService.createAnnouncement(
        JSON.stringify({
          content: content,
        }),
    ).then(() => {
      handleClose();
    });
  };

  const handleEdit = (event) => {
    event.preventDefault();
    HomeService.updateAnnouncement(
        JSON.stringify({
          id: selectedRow.id,
          content: content,
        }),
    ).then(() => {
      handleClose();
    });
  };

  const handleDelete = () => {
    HomeService.deleteAnnouncement(
        JSON.stringify({
          id: selectedRow.id,
        }),
    ).then(() => {
      handleClose();
    });
  };

  return (
    <div style={{paddingTop: '10px'}}>
      <BaseCard>
        <CardActions style={{justifyContent: 'space-between'}}>
          <Typography sx={{fontWeight: 'bold', ml: 2, mt: 1}} variant='h5' gutterBottom>
                        Announcements
          </Typography>
          {
            userData.isTA &&
              <Button sx={{fontWeight: 'bold', mr: 1}} variant='contained' onClick={handleAddDialog}>
                  + Create
              </Button>
          }
        </CardActions>
        <Divider></Divider>
        <TableContainer sx={{maxHeight: '200px'}}>
          <Table aria-label='topicsTable' sx={{overflow: 'scroll'}} stickyHeader>
            <TableBody>
              {rows.slice().reverse().map((row, index) => (
                <ItemRow key={row.id} index={index} rowKey={row.id}>
                  <TableCell component='th' scope='row' sx={{pl: 3.25}}>
                    <Typography sx={{fontWeight: 'bold', whiteSpace: 'pre-line'}}>
                      {row.content}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Stack sx={{mr: 2}} direction='row' margin='auto' justifyContent='flex-end'>
                      {
                        userData.isTA &&
                        <Box>
                          <IconButton sx={{mr: 1}} color='info' onClick={() => handleEditDialog(row)}>
                            <Edit />
                          </IconButton>

                          <IconButton color='error' onClick={() => handleDeleteDialog(row)}>
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
        title='Add New Announcement'
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
        title={'Edit Announcement'}
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
        title='Delete Announcement'
        isOpen={openDelete}
        onClose={handleClose}
        handleDelete={handleDelete}
        itemName={'this announcement'}
      />
    </div>
  );
}
