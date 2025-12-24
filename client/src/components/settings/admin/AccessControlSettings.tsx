import React, { useState, useMemo, useEffect } from 'react';
import {
  Button,
  Checkbox,
  TableCell,
  TableRow,
  Typography,
  useTheme,
  Stack,
} from '@mui/material';

import AccessControlDialogBody from './dialogs/AccessControlDialogBody';

import AddDialog from '../../common/dialogs/AddDialog';
import EditDialog from '../../common/dialogs/EditDialog';
import DeleteDialog from '../../common/dialogs/DeleteDialog';
import UploadDialog from '../../common/dialogs/UploadDialog';

import CollapsedTable from '../../common/table/CollapsedTable';
import EditDeleteRow from '../../common/table/EditDeleteRow';

import download from 'downloadjs';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useAuthToken } from "@convex-dev/auth/react";

export default function AccessControlSettings() {
  const theme = useTheme();

  // Access control enable/disable states
  const accessControlSettings = useQuery(api.settings.settings_get.getAccessControlSettings);
  const [selectedRowIdx, setSelectedRowIdx] = useState<number | null>(null);
  const [selectedListType, setSelectedListType] = useState<'whitelist' | 'blacklist' | null>(null);
  const token = useAuthToken();

  let rows: { email: string, isWhitelisted: boolean, isBlacklisted: boolean }[] = [];

  for (const email of accessControlSettings?.whitelistEmails || []) {
    rows.push({ email, isWhitelisted: true, isBlacklisted: false });
  }

  for (const email of accessControlSettings?.blacklistEmails || []) {
    rows.push({ email, isWhitelisted: false, isBlacklisted: true });
  }

  const handleDownload = async () => {
    if (!token) {
      console.error("No auth token available");
      return;
    }

    try {
      // For local dev, use the same URL. For production, replace .cloud with .site
      const httpActionUrl = import.meta.env.VITE_APP_CONVEX_SITE_URL;

      const response = await fetch(`${httpActionUrl}/download_access_control_csv`, {
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
        : "access_control_template.csv";

      download(blob, filename);
    } catch (error) {
      console.error("Error downloading CSV:", error);
    };
  };

  const updateWhitelistSettings = useMutation(api.settings.settings_mutate.updateWhitelistSettings);
  const updateBlacklistSettings = useMutation(api.settings.settings_mutate.updateBlacklistSettings);

  const handleUpdateWhitelist = async () => {
    await updateWhitelistSettings({
      enableWhitelist: !accessControlSettings!.whitelistEnabled,
    });
  };

  const handleUpdateBlacklist = async () => {
    await updateBlacklistSettings({
      enableBlacklist: !accessControlSettings!.blacklistEnabled,
    });
  };

  /** Dialog Functions */
  const [email, setEmail] = useState('');

  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');

  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openUpload, setOpenUpload] = useState(false);

  const handleAddDialog = () => {
    setOpenAdd(true);
    setEmail('');
    setSelectedListType('whitelist');
  };

  const handleEditDialog = (index: number, listType: 'whitelist' | 'blacklist') => {
    setOpenEdit(true);

    setSelectedRowIdx(index);
    setSelectedListType(listType);

    if (listType === 'whitelist') {
      setEmail(accessControlSettings!.whitelistEmails[index]);
    } else {
      setEmail(accessControlSettings!.blacklistEmails[index]);
    }
  };

  const handleDeleteDialog = (index: number) => {
    setOpenDelete(true);
    setSelectedRowIdx(index);
    setSelectedListType(null);
    setEmail(rows[index].email);
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

  const updateAccessControlledUser = useMutation(api.settings.settings_mutate.updateAccessControlledUser);

  // shared for add, edit, and delete
  const handleUpdate = async (event) => {
    event.preventDefault();

    await updateAccessControlledUser({
      email: email,
      is_whitelisted: selectedListType === 'whitelist',
      is_blacklisted: selectedListType === 'blacklist',
    });

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

      const response = await fetch(`${httpActionUrl}/upload_access_control_csv`, {
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
    };
  }

  const getStatusText = (row) => {
    if (row.isWhitelisted) return 'Whitelisted';
    if (row.isBlacklisted) return 'Blacklisted';
    return 'None';
  };

  const getStatusColor = (row) => {
    if (row.isWhitelisted) return 'success.main';
    if (row.isBlacklisted) return 'error.main';
    return 'text.secondary';
  };

  return (
    <div>
      <CollapsedTable
        title="Access Control Settings"
      >
        {/* Settings Controls */}
        <TableRow style={{background: theme.palette.background.paper}}>
          <TableCell colSpan={5} sx={{py: 3}}>
            <Stack spacing={2} sx={{px: 2}}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography>Enable Whitelist:</Typography>
                <Checkbox
                  checked={accessControlSettings?.whitelistEnabled || false}
                  onChange={handleUpdateWhitelist}
                />
                <Typography variant="caption" color="text.secondary">
                  Only whitelisted users can join the queue
                </Typography>
              </Stack>

              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography>Enable Blacklist:</Typography>
                <Checkbox
                  checked={accessControlSettings?.blacklistEnabled || false}
                  onChange={handleUpdateBlacklist}
                />
                <Typography variant="caption" color="text.secondary">
                  Blacklisted users cannot join the queue
                </Typography>
              </Stack>
            </Stack>
          </TableCell>
        </TableRow>

        {/* User List */}
        {rows.map((row, index) => (
          <EditDeleteRow
            key={row.email}
            index={index}
            row={row}
            rowKey={row.email}
            handleEdit={() => handleEditDialog(index, row.isWhitelisted ? 'whitelist' : 'blacklist')}
            handleDelete={() => handleDeleteDialog(index)}
          >
            <TableCell component="th" scope="row" sx={{pl: 3.25}}>
              <Typography sx={{fontWeight: 'bold'}}>
                {row.email}
              </Typography>
            </TableCell>
            <TableCell align="left">
              <Typography
                sx={{
                  fontWeight: 'bold',
                  color: getStatusColor(row),
                }}
              >
                {getStatusText(row)}
              </Typography>
            </TableCell>
          </EditDeleteRow>
        ))}

        {/* Action Buttons */}
        <TableRow
          key="actions"
          style={{background: theme.palette.background.default}}
        >
          <TableCell align="center" colSpan={5}>
            <Button sx={{mr: 1, fontWeight: 'bold'}} color="primary" variant="contained" onClick={() => handleAddDialog()}>
              + ADD USER
            </Button>
            <Button sx={{mr: 1, fontWeight: 'bold'}} color="info" variant="contained" onClick={() => handleDownload()}>
              DOWNLOAD CSV TEMPLATE
            </Button>
            <Button sx={{mr: 1, fontWeight: 'bold'}} color="info" variant="contained" onClick={() => handleUploadDialog()}>
              UPLOAD CSV
            </Button>
          </TableCell>
        </TableRow>
      </CollapsedTable>

      <AddDialog
        title="Add User to Access Control"
        isOpen={openAdd}
        onClose={handleClose}
        handleCreate={handleUpdate}
      >
        <AccessControlDialogBody
          email={email}
          setEmail={setEmail}
          listType={selectedListType}
          setListType={setSelectedListType}
        />
      </AddDialog>

      <EditDialog
        title={'Edit Access Control for "'+email+'"'}
        isOpen={openEdit}
        onClose={handleClose}
        handleEdit={handleUpdate}
      >
        <AccessControlDialogBody
          email={email}
          setEmail={setEmail}
          listType={selectedListType}
          setListType={setSelectedListType}
        />
      </EditDialog>

      <DeleteDialog
        title="Remove User from Access Control"
        isOpen={openDelete}
        onClose={handleClose}
        handleDelete={handleUpdate}
        itemName={' ' + (selectedRowIdx !== null && rows[selectedRowIdx!].email ? rows[selectedRowIdx!].email : '')}
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
