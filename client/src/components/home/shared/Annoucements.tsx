import React, { useState } from "react";
import {
  Box,
  Button,
  CardActions,
  IconButton,
  Divider,
  Stack,
  Typography,
  Table,
  TableCell,
  TableBody,
  TableContainer,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";

import AnnouncementDialogBody from "./dialogs/AnnouncementDialogBody";
import AddDialog from "../../common/dialogs/AddDialog";
import EditDialog from "../../common/dialogs/EditDialog";
import DeleteDialog from "../../common/dialogs/DeleteDialog";

import BaseCard from "../../common/cards/BaseCard";
import ItemRow from "../../common/table/ItemRow";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";

export default function Announcements() {
  const queueData = useQuery(api.home.home_get.getQueueData);
  const userData = useQuery(api.home.home_get.getUserData);
  const isTA = userData && userData.user_kind === "TA";
  const rows = queueData?.announcements || [];

  /** Dialog Functions */
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [content, setContent] = useState("");
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const handleAddDialog = () => {
    setOpenAdd(true);
    setContent("");
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

  const createAnnouncementMutation = useMutation(
    api.home.home_mutate.createAnnouncement,
  );
  const updateAnnouncementMutation = useMutation(
    api.home.home_mutate.updateAnnouncement,
  );
  const deleteAnnouncementMutation = useMutation(
    api.home.home_mutate.deleteAnnouncement,
  );

  const handleAdd = async (event) => {
    event.preventDefault();
    await createAnnouncementMutation({
      content: content,
    }).then(() => {
      handleClose();
    });
  };

  const handleEdit = async (event) => {
    event.preventDefault();
    await updateAnnouncementMutation({
      idx: selectedIdx!,
      content: content,
    });
  };

  const handleDelete = async (event) => {
    event.preventDefault();
    await deleteAnnouncementMutation({
      idx: selectedIdx!,
    });
  };

  return (
    <div style={{ paddingTop: "10px" }}>
      <BaseCard>
        <CardActions style={{ justifyContent: "space-between" }}>
          <Typography
            sx={{ fontWeight: "bold", ml: 2, mt: 1 }}
            variant="h5"
            gutterBottom
          >
            Announcements
          </Typography>
          {isTA && (
            <Button
              sx={{ fontWeight: "bold", mr: 1 }}
              variant="contained"
              onClick={handleAddDialog}
            >
              + Create
            </Button>
          )}
        </CardActions>
        <Divider></Divider>
        <TableContainer sx={{ maxHeight: "200px" }}>
          <Table
            aria-label="topicsTable"
            sx={{ overflow: "scroll" }}
            stickyHeader
          >
            <TableBody>
              {rows
                .slice()
                .reverse()
                .map((row, index) => (
                  <ItemRow key={index} index={index} rowKey={index}>
                    <TableCell component="th" scope="row" sx={{ pl: 3.25 }}>
                      <Typography
                        sx={{ fontWeight: "bold", whiteSpace: "pre-line" }}
                      >
                        {row}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack
                        sx={{ mr: 2 }}
                        direction="row"
                        margin="auto"
                        justifyContent="flex-end"
                      >
                        {isTA && (
                          <Box>
                            <IconButton
                              sx={{ mr: 1 }}
                              color="info"
                              onClick={() => handleEditDialog(row, index)}
                            >
                              <Edit />
                            </IconButton>

                            <IconButton
                              color="error"
                              onClick={() => handleDeleteDialog(index)}
                            >
                              <Delete />
                            </IconButton>
                          </Box>
                        )}
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
        <AnnouncementDialogBody content={content} setContent={setContent} />
      </AddDialog>

      <EditDialog
        title={"Edit Announcement"}
        isOpen={openEdit}
        onClose={handleClose}
        handleEdit={handleEdit}
      >
        <AnnouncementDialogBody content={content} setContent={setContent} />
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
