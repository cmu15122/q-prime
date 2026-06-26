import { useState } from 'react';
import {
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  TableCell,
  TableRow,
  Typography,
  useTheme,
} from '@mui/material';

import TADialogBody from './dialogs/TADialogBody';

import AddDialog from '../../common/dialogs/AddDialog';
import EditDialog from '../../common/dialogs/EditDialog';
import DeleteDialog from '../../common/dialogs/DeleteDialog';
import UploadDialog from '../../common/dialogs/UploadDialog';

import CollapsedTable from '../../common/table/CollapsedTable';
import EditDeleteRow from '../../common/table/EditDeleteRow';

import download from 'downloadjs';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { useAuthToken } from '@convex-dev/auth/react';
import { useCourseId } from '../../../contexts/CourseContext';

export default function TASettings() {
  const courseId = useCourseId();
  const tas = useQuery(api.settings.settings_get.getAllTAs, { courseId }) ?? [];

  const theme = useTheme();

  const [selectedRowIdx, setSelectedRowIdx] = useState<number | null>(null);

  const token = useAuthToken();
  const handleDownload = async () => {
    if (!token) {
      console.error('No auth token available');
      return;
    }

    try {
      // For local dev, use the same URL. For production, replace .cloud with .site
      const httpActionUrl = import.meta.env.VITE_APP_CONVEX_SITE_URL;

      const response = await fetch(`${httpActionUrl}/download_tas_csv?courseId=${courseId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }

      const blob = await response.blob();
      const contentDisposition = response.headers.get('Content-Disposition');
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
      const filename = filenameMatch ? filenameMatch[1] : 'tas_example.csv';

      download(blob, filename);
    } catch (error) {
      console.error('Error downloading CSV:', error);
    }
  };

  /** Dialog Functions */
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  const [file, setFile] = useState(null);
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

  const handleEditDialog = (index: number) => {
    setOpenEdit(true);
    setSelectedRowIdx(index);

    const selected_ta = tas![index];

    setName(selected_ta.name);
    setEmail(selected_ta.email);
    setIsAdmin(selected_ta.isAdmin);
  };

  const handleDeleteDialog = (index: number) => {
    setOpenDelete(true);
    setSelectedRowIdx(index);
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

  const createTAMutation = useMutation(api.settings.settings_mutate.createTA);
  const handleAdd = async (event) => {
    event.preventDefault();
    await createTAMutation({
      courseId,
      name: name,
      email: email,
      isAdmin: isAdmin,
    });
    handleClose();
  };

  const updateTAMutation = useMutation(api.settings.settings_mutate.updateTA);
  const handleEdit = async (event) => {
    event.preventDefault();
    await updateTAMutation({
      courseId,
      email: tas![selectedRowIdx!].email,
      isAdmin: isAdmin,
    });
    handleClose();
  };

  const deleteTAMutation = useMutation(api.settings.settings_mutate.deleteTA);
  const handleDelete = async () => {
    await deleteTAMutation({
      courseId,
      email: tas![selectedRowIdx!].email,
    });
    handleClose();
  };

  const handleUpload = async (event) => {
    event.preventDefault();
    if (file == null || !token) {
      console.error('No file selected or no auth token');
      return;
    }

    try {
      // For local dev, use the same URL. For production, replace .cloud with .site
      const httpActionUrl = import.meta.env.VITE_APP_CONVEX_SITE_URL;

      const response = await fetch(`${httpActionUrl}/upload_tas_csv?courseId=${courseId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
        body: file,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      console.log('CSV uploaded successfully');
      handleClose();
    } catch (error) {
      console.error('Error uploading CSV:', error);
    }
  };

  return (
    <div>
      <CollapsedTable title="TA Settings">
        {tas.map((row, index) => (
          <EditDeleteRow
            key={row.id}
            index={index}
            row={row}
            rowKey={row.id}
            handleEdit={() => handleEditDialog(index)}
            handleDelete={() => handleDeleteDialog(index)}
          >
            <TableCell component="th" scope="row" sx={{ pl: 3.25 }}>
              <Typography sx={{ fontWeight: 'bold' }}>
                {row.name} {row.isAdmin ? ' (Admin)' : ''}
              </Typography>
            </TableCell>
            <TableCell align="left">
              <Typography sx={{ fontStyle: 'italic' }}>{row.email}</Typography>
            </TableCell>
          </EditDeleteRow>
        ))}
        <TableRow key="actions" style={{ background: theme.palette.background.paper }}>
          <TableCell align="center" colSpan={5}>
            <Button
              sx={{ mr: 1, fontWeight: 'bold' }}
              color="primary"
              variant="contained"
              onClick={() => handleAddDialog()}
            >
              + Add TA
            </Button>
            <Button
              sx={{ mr: 1, fontWeight: 'bold' }}
              color="info"
              variant="contained"
              onClick={() => handleDownload()}
            >
              Download CSV Template
            </Button>
            <Button
              sx={{ mr: 1, fontWeight: 'bold' }}
              color="info"
              variant="contained"
              onClick={() => handleUploadDialog()}
            >
              Upload CSV
            </Button>
          </TableCell>
        </TableRow>
      </CollapsedTable>

      {tas && (
        <>
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
            title={'Edit Info for TA "' + name + '"'}
            isOpen={openEdit}
            onClose={handleClose}
            handleEdit={handleEdit}
          >
            <Grid container spacing={3}>
              <Grid className="d-flex" item xs={12}>
                <FormControlLabel
                  label="Is Admin?"
                  labelPlacement="start"
                  sx={{ pt: 1 }}
                  control={
                    <Checkbox checked={isAdmin} onChange={(e) => setIsAdmin(e.target.checked)} />
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
            itemName={
              ' ' +
              (selectedRowIdx !== null && tas[selectedRowIdx]?.name
                ? tas[selectedRowIdx!].name
                : '')
            }
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
        </>
      )}
    </div>
  );
}
