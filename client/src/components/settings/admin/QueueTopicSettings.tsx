import React, {useState, useEffect} from 'react';
import {
  Button, TableCell, TableRow, Typography, useTheme,
} from '@mui/material';

import TopicDialogBody from './dialogs/TopicDialogBody';

import AddDialog from '../../common/dialogs/AddDialog';
import EditDialog from '../../common/dialogs/EditDialog';
import DeleteDialog from '../../common/dialogs/DeleteDialog';
import UploadDialog from '../../common/dialogs/UploadDialog';

import CollapsedTable from '../../common/table/CollapsedTable';
import EditDeleteRow from '../../common/table/EditDeleteRow';

import SettingsService from '../../../services/SettingsService';

import {DateTime} from 'luxon';
import download from 'downloadjs';

function createData(assignmentId, name, category, startDate, endDate) {
  startDate = DateTime.fromISO(startDate);
  endDate = DateTime.fromISO(endDate);
  return {assignmentId, name, category, startDate, endDate};
}

export default function QueueTopicSettings(props) {
  const {queueData} = props;
  const theme = useTheme();

  const [selectedRow, setSelectedRow] = useState(null);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    if (queueData != null) {
      updateTopics(queueData.topics);
    }
  }, [queueData]);

  const updateTopics = (newTopics) => {
    const newRows = [];
    newTopics.forEach((topic) => {
      newRows.push(createData(
          topic.assignment_id,
          topic.name,
          topic.category,
          topic.start_date,
          topic.end_date,
      ));
    });
    setRows(newRows);
  };

  const handleDownload = () => {
    SettingsService.downloadTopicCSV()
        .then((result) => {
          download(result.data, 'topics_example.csv');
        });
  };

  /** Dialog Functions */
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [startDate, setStartDate] = useState(DateTime.now());
  const [endDate, setEndDate] = useState(DateTime.now());

  const [file, setFile] = useState();
  const [fileName, setFileName] = useState('');

  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openUpload, setOpenUpload] = useState(false);

  const handleAddDialog = () => {
    setOpenAdd(true);

    setName('');
    setCategory('');
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
    setFileName('');
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
    SettingsService.createTopic(
        JSON.stringify({
          name: name,
          category: category,
          start_date: startDate.toString(),
          end_date: endDate.toString(),
        }),
    ).then((res) => {
      updateTopics(res.data.topics);
      handleClose();
    });
  };

  const handleEdit = (event) => {
    event.preventDefault();
    SettingsService.updateTopic(
        JSON.stringify({
          assignment_id: selectedRow?.assignmentId,
          name: name,
          category: category,
          start_date: startDate.toString(),
          end_date: endDate.toString(),
        }),
    ).then((res) => {
      updateTopics(res.data.topics);
      handleClose();
    });
  };

  const handleDelete = () => {
    SettingsService.deleteTopic(
        JSON.stringify({
          assignment_id: selectedRow?.assignmentId,
        }),
    ).then((res) => {
      updateTopics(res.data.topics);
      handleClose();
    });
  };

  const handleUpload = (event) => {
    event.preventDefault();
    if (file == null) {
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    SettingsService.uploadTopicCSV(formData)
        .then((res) => {
          updateTopics(res.data.topics);
          handleClose();
        });
  };

  return (
    <div>
      <CollapsedTable
        title="Queue Topic Settings"
      >
        {
          rows.map((row, index) => (
            <EditDeleteRow
              key={row.name}
              index={index}
              row={row}
              rowKey={row.name}
              handleEdit={handleEditDialog}
              handleDelete={handleDeleteDialog}
            >
              <TableCell component="th" scope="row" sx={{pl: 3.25}}>
                <Typography sx={{fontWeight: 'bold'}}>
                  {row.name}
                </Typography>
              </TableCell>
              <TableCell align="left">
                <Typography sx={{fontStyle: 'italic'}}>
                  {row.category}
                </Typography>
              </TableCell>
              <TableCell align="left">
                <Typography>
                  {row.startDate.toLocaleString(DateTime.DATETIME_SHORT)}
                </Typography>
              </TableCell>
              <TableCell align="left">
                <Typography>
                  {row.endDate.toLocaleString(DateTime.DATETIME_SHORT)}
                </Typography>
              </TableCell>
            </EditDeleteRow>
          ))
        }
        <TableRow
          key="actions"
          style={{background: theme.palette.background.default}}
        >
          <TableCell align="center" colSpan={5}>
            <Button sx={{mr: 1, fontWeight: 'bold'}} color="primary" variant="contained" onClick={() => handleAddDialog()}>
              + Add Topic
            </Button>
            <Button sx={{mr: 1, fontWeight: 'bold'}} color="info" variant="contained" onClick={() => handleDownload()}>
              Download CSV Template
            </Button>
            <Button sx={{mr: 1, fontWeight: 'bold'}} color="info" variant="contained" onClick={() => handleUploadDialog()}>
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
        title={'Edit Topic Info'}
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
        itemName={' ' + selectedRow?.name}
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
