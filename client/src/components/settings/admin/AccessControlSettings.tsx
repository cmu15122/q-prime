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

import SettingsService from '../../../services/SettingsService';
import download from 'downloadjs';

function createData(email, isWhitelisted, isBlacklisted) {
  return { email, isWhitelisted, isBlacklisted };
}

export default function AccessControlSettings(props) {
  const theme = useTheme();

  // Access control enable/disable states
  const [enableWhitelist, setEnableWhitelist] = useState(false);
  const [enableBlacklist, setEnableBlacklist] = useState(false);

  const [whitelistEmails, setWhitelistEmails] = useState([]);
  const [blacklistEmails, setBlacklistEmails] = useState([]);

  useEffect(() => {
    SettingsService.getACLSettings().then((res) => {
      setEnableWhitelist(res.data.whitelistEnabled);
      setEnableBlacklist(res.data.blacklistEnabled);
      setWhitelistEmails(res.data.whitelistEmails);
      setBlacklistEmails(res.data.blacklistEmails);
    });
  }, []);

  const [selectedRow, setSelectedRow] = useState(null);

  const rows = useMemo(() => {
    // Create whitelist users
    const whitelistUsers = whitelistEmails.map((email) =>
      createData(email, true, false),
    ).sort((a, b) => a.email.localeCompare(b.email));

    // Create blacklist users
    const blacklistUsers = blacklistEmails.map((email) =>
      createData(email, false, true),
    ).sort((a, b) => a.email.localeCompare(b.email));

    // Return whitelist first, then blacklist
    return [...whitelistUsers, ...blacklistUsers];
  }, [whitelistEmails, blacklistEmails]);

  const handleDownload = () => {
    SettingsService.downloadAccessControlCSV().then((result) => {
      download(result.data, 'access_control_template.csv');
    });
  };

  const handleUpdateWhitelist = () => {
    SettingsService.updateWhitelistSettings(
        JSON.stringify({
          enableWhitelist: !enableWhitelist,
        }),
    ).then(() => {
      setEnableWhitelist(!enableWhitelist);
    });
  };

  const handleUpdateBlacklist = () => {
    SettingsService.updateBlacklistSettings(
        JSON.stringify({
          enableBlacklist: !enableBlacklist,
        }),
    ).then(() => {
      setEnableBlacklist(!enableBlacklist);
    });
  };

  /** Dialog Functions */
  const [email, setEmail] = useState('');
  const [listType, setListType] = useState('whitelist');

  const [file, setFile] = useState();
  const [fileName, setFileName] = useState('');

  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openUpload, setOpenUpload] = useState(false);

  const handleAddDialog = () => {
    setOpenAdd(true);
    setEmail('');
    setListType('whitelist');
  };

  const handleEditDialog = (row) => {
    setOpenEdit(true);
    setSelectedRow(row);
    setEmail(row.email);
    setListType(row.isWhitelisted ? 'whitelist' : 'blacklist');
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
    SettingsService.updateAccessControlUser(
        JSON.stringify({
          email: email,
          listType: listType,
          updateType: 'add',
        }),
    ).then(() => {
      // Update local state based on list type
      if (listType === 'whitelist') {
        setWhitelistEmails((prev) => [...prev, email]);
      } else {
        setBlacklistEmails((prev) => [...prev, email]);
      }
    });
    handleClose();
  };

  const handleEdit = (event) => {
    event.preventDefault();

    // Determine current and target lists
    const currentType = selectedRow.isWhitelisted ? 'whitelist' : 'blacklist';
    const oldEmail = selectedRow.email;

    if (currentType !== listType || oldEmail !== email) {
      // Remove from current list first
      SettingsService.updateAccessControlUser(
          JSON.stringify({
            email: oldEmail,
            listType: currentType,
            updateType: 'remove',
          }),
      ).then(() => {
        // Add to new list
        return SettingsService.updateAccessControlUser(
            JSON.stringify({
              email: email,
              listType: listType,
              updateType: 'add',
            }),
        );
      }).then(() => {
        // Update local state
        if (currentType === 'whitelist') {
          setWhitelistEmails((prev) => prev.filter((e) => e !== oldEmail));
        } else {
          setBlacklistEmails((prev) => prev.filter((e) => e !== oldEmail));
        }

        if (listType === 'whitelist') {
          setWhitelistEmails((prev) => [...prev, email]);
        } else {
          setBlacklistEmails((prev) => [...prev, email]);
        }
      });
    }
    handleClose();
  };

  const handleDelete = () => {
    const currentType = selectedRow.isWhitelisted ? 'whitelist' : 'blacklist';
    SettingsService.updateAccessControlUser(
        JSON.stringify({
          email: selectedRow.email,
          listType: currentType,
          updateType: 'remove',
        }),
    ).then(() => {
      // Update local state
      if (currentType === 'whitelist') {
        setWhitelistEmails((prev) => prev.filter((e) => e !== selectedRow.email));
      } else {
        setBlacklistEmails((prev) => prev.filter((e) => e !== selectedRow.email));
      }
    });
    handleClose();
  };

  const handleUpload = (event) => {
    event.preventDefault();
    if (file == null) {
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    SettingsService.uploadAccessControlCSV(formData).then(() => {
      // Refresh admin settings to get updated lists
      SettingsService.getACLSettings().then((res) => {
        setWhitelistEmails(res.data.whitelistEmails);
        setBlacklistEmails(res.data.blacklistEmails);
      });
    });
    handleClose();
  };

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
                  checked={enableWhitelist}
                  onChange={handleUpdateWhitelist}
                />
                <Typography variant="caption" color="text.secondary">
                  Only whitelisted users can join the queue
                </Typography>
              </Stack>

              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography>Enable Blacklist:</Typography>
                <Checkbox
                  checked={enableBlacklist}
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
            handleEdit={handleEditDialog}
            handleDelete={handleDeleteDialog}
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
        handleCreate={handleAdd}
      >
        <AccessControlDialogBody
          email={email}
          setEmail={setEmail}
          listType={listType}
          setListType={setListType}
        />
      </AddDialog>

      <EditDialog
        title={'Edit Access Control for "'+email+'"'}
        isOpen={openEdit}
        onClose={handleClose}
        handleEdit={handleEdit}
      >
        <AccessControlDialogBody
          email={email}
          setEmail={setEmail}
          listType={listType}
          setListType={setListType}
        />
      </EditDialog>

      <DeleteDialog
        title="Remove User from Access Control"
        isOpen={openDelete}
        onClose={handleClose}
        handleDelete={handleDelete}
        itemName={' ' + selectedRow?.email}
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
