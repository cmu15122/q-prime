import React, {useState, useEffect, useContext, useMemo} from 'react';
import {
  Button, Checkbox, FormControlLabel, Grid, TableCell, TableRow, Typography, useTheme,
} from '@mui/material';

import TADialogBody from './dialogs/TADialogBody';

import AddDialog from '../../common/dialogs/AddDialog';
import EditDialog from '../../common/dialogs/EditDialog';
import DeleteDialog from '../../common/dialogs/DeleteDialog';
import UploadDialog from '../../common/dialogs/UploadDialog';

import CollapsedTable from '../../common/table/CollapsedTable';
import EditDeleteRow from '../../common/table/EditDeleteRow';

import SettingsService from '../../../services/SettingsService';
import download from 'downloadjs';
import {QueueDataContext} from '../../../contexts/QueueDataContext';

function createData(userId, name, email, isAdmin) {
  return {userId, name, email, isAdmin};
}

export default function TASettings(props) {
  const {queueData} = useContext(QueueDataContext);
  const theme = useTheme();

  const [selectedRow, setSelectedRow] = useState(null);

  const rows = useMemo(() => {
    if (queueData != null) {
      const newRows = [];
      queueData.tas.forEach((ta) => {
        newRows.push(createData(
            ta.ta_id,
            ta.preferred_name,
            ta.email,
            ta.isAdmin,
        ));
      });
      return newRows;
    } else return [];
  }, [queueData.tas]);

  const handleDownload = () => {
    SettingsService.downloadTACSV()
        .then((result) => {
          download(result.data, 'ta_example.csv');
        });
  };

  /** Dialog Functions */
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  const [file, setFile] = useState();
  const [fileName, setFileName] = useState('');

  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openUpload, setOpenUpload] = useState(false);

  const handleAddDialog = () => {
    setOpenAdd(true);

    setName('');
    setEmail('');
    setIsAdmin(false);
  };

  const handleEditDialog = (row) => {
    setOpenEdit(true);
    setSelectedRow(row);

    setName(row.name);
    setEmail(row.email);
    setIsAdmin(row.isAdmin);
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

  const handleAdd = (event) => {
    event.preventDefault();
    SettingsService.createTA(
        JSON.stringify({
          name: name,
          email: email,
          isAdmin: isAdmin,
        }),
    );
    handleClose();
  };

  const handleEdit = (event) => {
    event.preventDefault();
    SettingsService.updateTA(
        JSON.stringify({
          user_id: selectedRow.userId,
          isAdmin: isAdmin,
        }),
    );
    handleClose();
  };

  const handleDelete = () => {
    SettingsService.deleteTA(
        JSON.stringify({
          user_id: selectedRow.userId,
        }),
    );
    handleClose();
  };

  const handleUpload = (event) => {
    event.preventDefault();
    if (file == null) {
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    SettingsService.uploadTACSV(formData);
    handleClose();
  };

  return (
    <div>
      <CollapsedTable
        title="TA Settings"
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
                  {row.name} {row.isAdmin ? ' (Admin)' : ''}
                </Typography>
              </TableCell>
              <TableCell align="left">
                <Typography sx={{fontStyle: 'italic'}}>
                  {row.email}
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
              + Add TA
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
        title="Add New TA"
        isOpen={openAdd}
        onClose={handleClose}
        handleCreate={handleAdd}
      >
        <TADialogBody
          name={name}
          setName={setName}
          isAdmin={isAdmin}
          setIsAdmin={setIsAdmin}
          email={email}
          setEmail={setEmail}
        />
      </AddDialog>

      <EditDialog
        title={'Edit Info for TA "'+name+'"'}
        isOpen={openEdit}
        onClose={handleClose}
        handleEdit={handleEdit}
      >
        <Grid container spacing={3}>
          <Grid className="d-flex" item xs={12}>
            <FormControlLabel
              label="Is Admin?"
              labelPlacement="start"
              sx={{pt: 1}}
              control={
                <Checkbox
                  checked={isAdmin}
                  onChange={(e) => setIsAdmin(e.target.checked)}
                />
              }
            />
          </Grid>
        </Grid>
      </EditDialog>

      <DeleteDialog
        title="Delete TA"
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
