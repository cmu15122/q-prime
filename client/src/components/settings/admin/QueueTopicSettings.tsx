import React, { useState, useMemo } from "react";
import {
  Button,
  TableCell,
  TableRow,
  Typography,
  useTheme,
} from "@mui/material";

import TopicDialogBody from "./dialogs/TopicDialogBody";

import AddDialog from "../../common/dialogs/AddDialog";
import EditDialog from "../../common/dialogs/EditDialog";
import DeleteDialog from "../../common/dialogs/DeleteDialog";
import UploadDialog from "../../common/dialogs/UploadDialog";

import CollapsedTable from "../../common/table/CollapsedTable";
import EditDeleteRow from "../../common/table/EditDeleteRow";

import { DateTime } from "luxon";
import download from "downloadjs";

function createData(assignment_id, name, assignment_type, startDate, endDate) {
  startDate = DateTime.fromMillis(startDate);
  endDate = DateTime.fromMillis(endDate);
  return { assignment_id, name, assignment_type, startDate, endDate };
}

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useAuthToken } from "@convex-dev/auth/react";

export default function QueueTopicSettings() {
  const currAssignments = useQuery(api.home.home_get.getAllAssignments);
  const token = useAuthToken();

  const theme = useTheme();

  const [selectedRow, setSelectedRow] = useState(null);

  const handleDownload = async () => {
    if (!token) {
      console.error("No auth token available");
      return;
    }

    try {
      // For local dev, use the same URL. For production, replace .cloud with .site
      const httpActionUrl = import.meta.env.VITE_APP_CONVEX_SITE_URL;

      const response = await fetch(`${httpActionUrl}/download_assignment_csv`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }

      const blob = await response.blob();
      const contentDisposition = response.headers.get("Content-Disposition");
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
      const filename = filenameMatch
        ? filenameMatch[1]
        : "assignments_example.csv";

      download(blob, filename);
    } catch (error) {
      console.error("Error downloading CSV:", error);
    }
  };

  /** Dialog Functions */
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [startDate, setStartDate] = useState(DateTime.now());
  const [endDate, setEndDate] = useState(DateTime.now());

  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");

  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openUpload, setOpenUpload] = useState(false);

  const handleAddDialog = () => {
    setOpenAdd(true);

    setName("");
    setCategory("");
    setStartDate(DateTime.now());
    setEndDate(DateTime.now());
  };

  const handleEditDialog = (row) => {
    setOpenEdit(true);
    setSelectedRow(row);

    setName(row.name);
    setCategory(row.category);
    setStartDate(row.startDate);
    setEndDate(row.endDate);
  };

  const handleDeleteDialog = (row) => {
    setOpenDelete(true);
    setSelectedRow(row);
  };

  const handleUploadDialog = () => {
    setOpenUpload(true);
    setFile(null);
    setFileName("");
  };

  const handleClose = () => {
    setOpenAdd(false);
    setOpenEdit(false);
    setOpenDelete(false);
    setOpenUpload(false);
  };

  const updateStartDate = (newStartDate) => {
    setStartDate(newStartDate);
    if (newStartDate > endDate) {
      setEndDate(newStartDate);
    }
  };

  const handleAdd = (event) => {
    event.preventDefault();
    // TODO: Implement create topic mutation
    console.log("Create topic not yet implemented");

    handleClose();
  };

  const handleEdit = (event) => {
    event.preventDefault();
    // TODO: Implement update topic mutation
    console.log("Update topic not yet implemented");

    handleClose();
  };

  const handleDelete = () => {
    // TODO: Implement delete topic mutation
    console.log("Delete topic not yet implemented");

    handleClose();
  };

  const handleUpload = async (event) => {
    event.preventDefault();
    if (file == null || !token) {
      console.error("No file selected or no auth token");
      return;
    }

    try {
      // For local dev, use the same URL. For production, replace .cloud with .site
      const httpActionUrl = import.meta.env.VITE_APP_CONVEX_SITE_URL;

      const response = await fetch(`${httpActionUrl}/upload_assignment_csv`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: file,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      console.log("CSV uploaded successfully");
      handleClose();
    } catch (error) {
      console.error("Error uploading CSV:", error);
    }
  };

  return (
    <div>
      <CollapsedTable title="Queue Topic Settings">
        {(currAssignments ?? []).map((row, index) => (
          <EditDeleteRow
            key={row._id}
            index={index}
            row={row}
            rowKey={row._id}
            handleEdit={handleEditDialog}
            handleDelete={handleDeleteDialog}
          >
            <TableCell component="th" scope="row" sx={{ pl: 3.25 }}>
              <Typography sx={{ fontWeight: "bold" }}>{row.name}</Typography>
            </TableCell>
            <TableCell align="left">
              <Typography sx={{ fontStyle: "italic" }}>
                {row.assignment_type}
              </Typography>
            </TableCell>
            <TableCell align="left">
              <Typography>
                {new Date(row.start_date_ms).toLocaleString()}
              </Typography>
            </TableCell>
            <TableCell align="left">
              <Typography>
                {new Date(row.end_date_ms).toLocaleString()}
              </Typography>
            </TableCell>
          </EditDeleteRow>
        ))}
        <TableRow
          key="actions"
          style={{ background: theme.palette.background.default }}
        >
          <TableCell align="center" colSpan={5}>
            <Button
              sx={{ mr: 1, fontWeight: "bold" }}
              color="primary"
              variant="contained"
              onClick={() => handleAddDialog()}
            >
              + Add Topic
            </Button>
            <Button
              sx={{ mr: 1, fontWeight: "bold" }}
              color="info"
              variant="contained"
              onClick={() => handleDownload()}
            >
              Download CSV Template
            </Button>
            <Button
              sx={{ mr: 1, fontWeight: "bold" }}
              color="info"
              variant="contained"
              onClick={() => handleUploadDialog()}
            >
              Upload CSV
            </Button>
          </TableCell>
        </TableRow>
      </CollapsedTable>

      <AddDialog
        title="Add New Topic"
        isOpen={openAdd}
        onClose={handleClose}
        handleCreate={handleAdd}
      >
        <TopicDialogBody
          name={name}
          setName={setName}
          category={category}
          setCategory={setCategory}
          startDate={startDate}
          setStartDate={updateStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
        />
      </AddDialog>

      <EditDialog
        title={"Edit Topic Info"}
        isOpen={openEdit}
        onClose={handleClose}
        handleEdit={handleEdit}
      >
        <TopicDialogBody
          name={name}
          setName={setName}
          category={category}
          setCategory={setCategory}
          startDate={startDate}
          setStartDate={updateStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
        />
      </EditDialog>

      <DeleteDialog
        title="Delete Topic"
        isOpen={openDelete}
        onClose={handleClose}
        handleDelete={handleDelete}
        itemName={" " + selectedRow?.name}
      />

      <UploadDialog
        isOpen={openUpload}
        onClose={handleClose}
        handleUpload={handleUpload}
        file={file}
        setFile={setFile}
        fileName={fileName}
        setFileName={setFileName}
      />
    </div>
  );
}
