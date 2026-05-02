import React, { useState, useEffect } from 'react';
import {
  Button,
  CardContent,
  Typography,
  TextField,
  Stack,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import { Delete, Add } from '@mui/icons-material';

import BaseCard from '../common/cards/BaseCard';

import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import TASettings from './admin/TASettings';
import { useCourseId } from '../../contexts/CourseContext';

export default function OwnerSettings() {
  const courseId = useCourseId();
  const userData = useQuery(api.home.home_get.getUserData, { courseId });
  const adminSettings = useQuery(api.settings.settings_get.getQueueSettings, { courseId });

  const [isEditing, setIsEditing] = useState(false);
  const [newSemName, setNewSemName] = useState<string>('');
  const [ownerEmails, setOwnerEmails] = useState<{ id: number; value: string }[]>([]);
  const [nextId, setNextId] = useState(0);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  useEffect(() => {
    if (adminSettings && !isEditing) {
      setNewSemName(adminSettings.currSem);
      const emails = adminSettings.ownerEmails.map((email, idx) => ({
        id: idx,
        value: email,
      }));
      setOwnerEmails(emails);
      setNextId(emails.length);
    }
  }, [adminSettings, isEditing]);

  const changeSemesterMutation = useMutation(api.settings.settings_mutate.changeSemester);

  const handleStartEditing = () => {
    setIsEditing(true);
    if (adminSettings) {
      setNewSemName(adminSettings.currSem);
      const emails = adminSettings.ownerEmails.map((email, idx) => ({
        id: idx,
        value: email,
      }));
      setOwnerEmails(emails);
      setNextId(emails.length);
    }
  };

  const handleCancelEditing = () => {
    setIsEditing(false);
    // State will be reset by useEffect
  };

  const handleAddEmail = () => {
    setOwnerEmails([...ownerEmails, { id: nextId, value: '' }]);
    setNextId(nextId + 1);
  };

  const handleRemoveEmail = (id: number) => {
    if (ownerEmails.length > 1) {
      setOwnerEmails(ownerEmails.filter((email) => email.id !== id));
    }
  };

  const handleEmailChange = (id: number, value: string) => {
    setOwnerEmails(ownerEmails.map((email) => (email.id === id ? { ...email, value } : email)));
  };

  const handleSaveClick = (event: React.FormEvent) => {
    event.preventDefault();
    setConfirmModalOpen(true);
  };

  const checkNewSemUser = useMutation(api.home.home_mutate.enrollInCourse);

  const handleConfirmChange = async () => {
    const ownerEmailsArray = ownerEmails
      .map((email) => email.value.trim())
      .filter((e) => e.length > 0);

    await changeSemesterMutation({
      courseId,
      new_sem_name: newSemName,
      owner_emails: ownerEmailsArray,
    });

    // make new sem user for the owner who just changed the semester
    await checkNewSemUser({ courseId });

    setConfirmModalOpen(false);
    setIsEditing(false);
  };

  const currentUserEmail = userData?.email;
  const isRemovingSelf =
    currentUserEmail && !ownerEmails.some((e) => e.value.trim() === currentUserEmail);

  // if user is not an admin TA, we should still show TASettings so they can add new TAs
  // if they are an admin TA, then AdminMain will show this

  return (
    <div style={{ paddingBottom: '80px' }}>
      <Typography variant="h4" textAlign="center" sx={{ my: 4 }} fontWeight="bold">
        Owner Settings
      </Typography>

      <BaseCard>
        <CardContent>
          <Typography sx={{ fontWeight: 'bold', mt: 1 }} variant="body1" gutterBottom>
            Owner Settings
          </Typography>

          <Stack spacing={2} sx={{ mt: 1 }}>
            {!isEditing ? (
              <Stack direction="row" alignItems="center" spacing={2}>
                <Typography>Current Semester:</Typography>
                <TextField size="small" value={newSemName ?? ''} disabled sx={{ width: 80 }} />
                {userData?.is_owner && (
                  <Button variant="contained" onClick={handleStartEditing}>
                    Change Semester
                  </Button>
                )}
                <Typography variant="caption" color="text.secondary">
                  {!(userData?.is_owner || false)
                    ? `Only ${adminSettings?.ownerEmails?.join(', ') || []} can change semester`
                    : 'Each semester has its own settings and stats'}
                </Typography>
              </Stack>
            ) : (
              <form onSubmit={handleSaveClick}>
                <List>
                  <Stack direction="column" spacing={1} sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" fontWeight="bold">
                      New Semester Name
                    </Typography>
                    <TextField
                      size="small"
                      value={newSemName}
                      onChange={(e) => setNewSemName(e.target.value)}
                      required
                      inputProps={{ maxLength: 10 }}
                      sx={{ width: 150 }}
                      placeholder="e.g. S26"
                    />
                  </Stack>

                  <Typography variant="subtitle2" fontWeight="bold" sx={{ mt: 2, mb: 1 }}>
                    Owner Emails for {newSemName}:
                  </Typography>

                  {ownerEmails.map((email, index) => (
                    <ListItem
                      key={email.id}
                      sx={{ display: 'flex', alignItems: 'flex-end', px: 0 }}
                    >
                      <TextField
                        label={`Owner Email ${index + 1}`}
                        variant="standard"
                        required
                        type="email"
                        fullWidth
                        value={email.value}
                        onChange={(e) => handleEmailChange(email.id, e.target.value)}
                      />
                      <IconButton
                        onClick={() => handleRemoveEmail(email.id)}
                        disabled={ownerEmails.length === 1}
                        color="error"
                        aria-label="remove email"
                        sx={{ ml: 1, mb: 0.5 }}
                      >
                        <Delete />
                      </IconButton>
                    </ListItem>
                  ))}

                  <ListItem sx={{ mt: 1, px: 0 }}>
                    <Button
                      startIcon={<Add />}
                      onClick={handleAddEmail}
                      variant="outlined"
                      size="small"
                    >
                      Add Owner
                    </Button>
                  </ListItem>
                </List>

                <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                  <Button variant="outlined" onClick={handleCancelEditing}>
                    Cancel
                  </Button>
                  <Button variant="contained" type="submit" color="primary">
                    Save Changes
                  </Button>
                </Stack>
              </form>
            )}
          </Stack>
        </CardContent>
      </BaseCard>

      <Dialog open={confirmModalOpen} onClose={() => setConfirmModalOpen(false)}>
        <DialogTitle>Confirm Semester Change</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to change the semester to <strong>{newSemName}</strong>?
          </DialogContentText>
          <DialogContentText sx={{ mt: 2 }}>
            <strong>Owners:</strong>
          </DialogContentText>
          <List dense>
            {ownerEmails.map((e) => (
              <ListItem key={e.id}>
                <ListItemText primary={e.value} />
              </ListItem>
            ))}
          </List>
          {isRemovingSelf && (
            <DialogContentText color="error" sx={{ mt: 2, fontWeight: 'bold' }}>
              Warning: You are not included in the new owner list. You will lose owner access to the
              new semester immediately after this change.
            </DialogContentText>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmModalOpen(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmChange}
            variant="contained"
            color={isRemovingSelf ? 'error' : 'primary'}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {userData && !userData.ta_data?.is_admin && <TASettings />}
    </div>
  );
}
