import React, { useState } from 'react';

import {
  CardContent,
  Container,
  ListItemText,
  ListItem,
  List,
  Typography,
  TextField,
  Button,
  IconButton,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Delete, Add } from '@mui/icons-material';
import BaseCard from '../components/common/cards/BaseCard';
import { api } from '../../convex/_generated/api';
import { useMutation, useQuery } from 'convex/react';
import { useAuthActions } from '@convex-dev/auth/react';

function Init() {
  const theme = useTheme();

  const [semesterName, setSemesterName] = useState('');
  const [ownerEmails, setOwnerEmails] = useState([{ id: 0, value: '' }]);
  const [nextId, setNextId] = useState(1);

  const queueData = useQuery(api.home.home_get.getQueueData);
  const firstTimeSetupMutation = useMutation(api.home.home_mutate.firstTimeSetup);

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

  const { signIn } = useAuthActions();

  const handleContinue = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Browser validation has passed at this point
    const ownerEmailsArray = ownerEmails.map((email) => email.value.trim());

    await firstTimeSetupMutation({
      semester_name: semesterName,
      owner_emails: ownerEmailsArray,
    });

    signIn('google', { redirectTo: `${import.meta.env.BASE_URL || '/'}settings` });
  };

  return (
    <div className="Init" style={{ backgroundColor: theme.palette.background.default }}>
      <Container sx={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
        <BaseCard>
          <CardContent>
            {queueData === null ? (
              <form onSubmit={handleContinue}>
                <Typography variant="h3">First Time Setup</Typography>
                <Typography variant="body1" sx={{ mt: 2 }}>
                  Welcome to the Office Hours Queue! We'll get started by setting up a new semester
                  for the OHQ. Each semester has its own owner accounts, admins, tas, assignments,
                  and metrics.
                </Typography>

                <Typography variant="body1" sx={{ mt: 2 }}>
                  Here, we'll specify the owner emails. An owner of a semester has permenant write
                  access to the semester's TA list. We recommend using a group email for your course
                  as an owner email. TAs graduate and Professors can change, so tying the owner to a
                  specific person's academic email can be risky.
                </Typography>

                <Typography variant="body1" sx={{ mt: 2 }}>
                  You'll only see this dialog once, the very first time you setup the OHQ. After
                  specifying the first semester's owners, we'll move you to the normal settings
                  page.
                </Typography>
                <List>
                  <ListItem sx={{ display: 'flex', alignItems: 'flex-end' }}>
                    <ListItemText
                      primary="Step 1: Name your semester (e.g. 'S26')"
                      sx={{ width: 300, px: 1, flexShrink: 0 }}
                    />
                    <TextField
                      label="Semester Name"
                      variant="standard"
                      required
                      fullWidth
                      value={semesterName}
                      onChange={(e) => setSemesterName(e.target.value)}
                    />
                  </ListItem>

                  {ownerEmails.map((email, index) => (
                    <ListItem
                      key={email.id}
                      sx={{ display: 'flex', alignItems: 'flex-end', pb: 0 }}
                    >
                      {index === 0 ? (
                        <ListItemText
                          primary="Step 2: Specify the owner emails"
                          sx={{ width: 300, px: 1, flexShrink: 0 }}
                        />
                      ) : (
                        <ListItemText sx={{ width: 300, px: 1, flexShrink: 0 }} />
                      )}
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

                  <ListItem sx={{ mt: 2, display: 'flex', alignItems: 'flex-start' }}>
                    <ListItemText sx={{ width: 200, px: 1, flexShrink: 0 }} />
                    <Button startIcon={<Add />} onClick={handleAddEmail} variant="outlined">
                      Add Owner
                    </Button>
                  </ListItem>
                </List>

                <Button variant="contained" type="submit" sx={{ mt: 2 }}>
                  Log In With Owner Account
                </Button>
              </form>
            ) : (
              <>
                <Typography variant="h3">First Time Setup</Typography>
                <Typography variant="body1" sx={{ mt: 2 }}>
                  First Time Setup has already been completed. Please visit the settings page to
                  change semesters.
                </Typography>
              </>
            )}
          </CardContent>
        </BaseCard>
      </Container>
    </div>
  );
}

export default Init;
