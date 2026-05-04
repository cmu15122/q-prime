import { useState } from 'react';
import {
  Box,
  Divider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  Typography,
} from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';
import Linkify from 'linkify-react';

import AnnouncementDialogBody from './dialogs/AnnouncementDialogBody';
import AddDialog from '../../common/dialogs/AddDialog';
import EditDialog from '../../common/dialogs/EditDialog';
import DeleteDialog from '../../common/dialogs/DeleteDialog';

import BaseCard from '../../common/cards/BaseCard';
import ItemRow from '../../common/table/ItemRow';
import OhqButton from '../../common/buttons/OhqButton';

import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { useCourseId } from '../../../contexts/CourseContext';
import { t, s } from '../../../themes/styles';

export default function Announcements() {
  const courseId = useCourseId();
  const queueData = useQuery(api.home.home_get.getQueueData, { courseId });
  const userData = useQuery(api.home.home_get.getUserData, { courseId });
  const isTA = userData && userData.user_kind === 'TA';
  const rows = queueData?.announcements || [];

  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [content, setContent] = useState('');
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const handleAddDialog = () => {
    setOpenAdd(true);
    setContent('');
  };

  const handleEditDialog = (row, idx) => {
    setOpenEdit(true);
    setSelectedIdx(idx);
    setContent(row.content);
  };

  const handleDeleteDialog = (idx) => {
    setOpenDelete(true);
    setSelectedIdx(idx);
  };

  const handleClose = () => {
    setOpenAdd(false);
    setOpenEdit(false);
    setOpenDelete(false);
  };

  const createAnnouncementMutation = useMutation(api.home.home_mutate.createAnnouncement);
  const updateAnnouncementMutation = useMutation(api.home.home_mutate.updateAnnouncement);
  const deleteAnnouncementMutation = useMutation(api.home.home_mutate.deleteAnnouncement);

  const handleAdd = async (event) => {
    event.preventDefault();
    await createAnnouncementMutation({ courseId, content }).then(() => handleClose());
  };

  const handleEdit = async (event) => {
    event.preventDefault();
    await updateAnnouncementMutation({ courseId, idx: selectedIdx!, content }).then(() =>
      handleClose(),
    );
  };

  const handleDelete = async () => {
    await deleteAnnouncementMutation({ courseId, idx: selectedIdx! }).then(() => handleClose());
  };

  return (
    <>
      <BaseCard>
        <Box sx={{ ...s.cardHeader, alignItems: 'center' }}>
          <Box>
            <Box component="h2" sx={t.cardTitle}>
              Announcements
            </Box>
            {isTA && (
              <Typography sx={[t.bodyMuted, { mt: 0.5 }]}>
                Announcements are public to all students.
              </Typography>
            )}
          </Box>
          {isTA && (
            <OhqButton
              variant="primary"
              onClick={handleAddDialog}
              startIcon={<Add fontSize="small" />}
            >
              Create
            </OhqButton>
          )}
        </Box>
        <Divider />
        {rows.length > 0 && (
          <TableContainer sx={{ maxHeight: 200 }}>
            <Table aria-label="announcementsTable" stickyHeader>
              <TableBody>
                {rows
                  .slice()
                  .reverse()
                  .map((row, index) => (
                    <ItemRow key={index} index={index} rowKey={index}>
                      <TableCell component="th" scope="row" sx={{ pl: 3.25 }}>
                        <Typography
                          sx={[
                            t.body,
                            {
                              whiteSpace: 'pre-line',
                              '& a': { color: 'forest.main', cursor: 'pointer' },
                            },
                          ]}
                        >
                          <Linkify options={{ target: '_blank' }}>{row}</Linkify>
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ width: 120 }}>
                        {isTA && (
                          <Stack
                            direction="row"
                            spacing={0.5}
                            justifyContent="flex-end"
                            sx={{ mr: 1.5 }}
                          >
                            <OhqButton
                              variant="icon"
                              aria-label="edit"
                              onClick={() => handleEditDialog(row, index)}
                            >
                              <Edit fontSize="small" />
                            </OhqButton>
                            <OhqButton
                              variant="icon"
                              tone="danger"
                              aria-label="delete"
                              onClick={() => handleDeleteDialog(index)}
                            >
                              <Delete fontSize="small" />
                            </OhqButton>
                          </Stack>
                        )}
                      </TableCell>
                    </ItemRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </BaseCard>

      <AddDialog
        title="Announcement"
        isOpen={openAdd}
        onClose={handleClose}
        handleCreate={handleAdd}
      >
        <AnnouncementDialogBody content={content} setContent={setContent} />
      </AddDialog>

      <EditDialog
        title="Announcement"
        isOpen={openEdit}
        onClose={handleClose}
        handleEdit={handleEdit}
      >
        <AnnouncementDialogBody content={content} setContent={setContent} />
      </EditDialog>

      <DeleteDialog
        title="Announcement"
        isOpen={openDelete}
        onClose={handleClose}
        handleDelete={handleDelete}
        itemName="this announcement"
      />
    </>
  );
}
