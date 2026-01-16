import React, { useState } from 'react';

import { CardContent, Container, ListItemText, ListItem, List, Typography, TextField, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import BaseCard from '../components/common/cards/BaseCard';

function Init() {
  const theme = useTheme();

  const [semesterName, setSemesterName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');

  const handleContinue = () => {
    console.log('Continue');
  };

  return (
    <div
      className="Init"
      style={{ backgroundColor: theme.palette.background.default }}
    >
      <Container sx={{ display: "flex", minHeight: "100vh", flexDirection: "column" }}>
        <BaseCard>
          <CardContent>
            <Typography variant="h3">First Time Setup</Typography>
            <Typography variant="body1" sx={{ mt: 2 }}>
              Welcome to the Office Hours Queue! We'll get started by setting up a new semester for the OHQ. Each semester has its own owner account, admins, tas, assignments, and metrics.
            </Typography>

            <Typography variant="body1" sx={{ mt: 2 }}>
              Here, we'll specify the owner email. The owner of a semester has permenant write access to the semester's TA list. We recommend using a group email for your course as the owner email. TAs graduate and Professors can retire, so tying the owner to a specific person's academic email can be risky.
            </Typography>

            <Typography variant="body1" sx={{ mt: 2 }}>
              You'll only see this dialog once, the very first time you setup the OHQ. After specifying the first semester's owner, we'll move you to the normal settings page.
            </Typography>
            <List>
              <ListItem sx={{ display: 'flex', alignItems: 'flex-end' }}>
                <ListItemText primary="Step 1: Name your semester (e.g. 'S26')" sx={{ width: 400, px: 1 }} />
                <TextField
                  label="Semester Name"
                  variant="standard"
                  required
                  fullWidth
                  value={semesterName}
                  onChange={(e) => setSemesterName(e.target.value)}
                />
              </ListItem>
              <ListItem sx={{ display: 'flex', alignItems: 'flex-end' }}>
                <ListItemText primary="Step 2: Specify the owner email" sx={{ width: 400, px: 1 }} />
                <TextField
                  label="Owner Email"
                  variant="standard"
                  required
                  fullWidth
                  value={ownerEmail}
                  onChange={(e) => setOwnerEmail(e.target.value)}
                />
              </ListItem>
            </List>

            <Button variant="contained" onClick={handleContinue} sx={{ mt: 2 }}>Continue</Button>
          </CardContent>
        </BaseCard>
      </Container>
    </div>
  );

}

export default Init;
