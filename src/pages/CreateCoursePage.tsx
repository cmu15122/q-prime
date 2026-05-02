import { useState } from 'react';
import {
  Container,
  TextField,
  Button,
  Typography,
  Stack,
  IconButton,
  Alert,
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useConvexAuth, useMutation } from 'convex/react';
import { useAuthActions } from '@convex-dev/auth/react';
import { api } from '../../convex/_generated/api';

export default function CreateCoursePage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signIn } = useAuthActions();

  const [slug, setSlug] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [semesterName, setSemesterName] = useState('');
  const [emails, setEmails] = useState([{ id: 0, value: '' }]);
  const [nextId, setNextId] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const createCourse = useMutation(api.courses.createCourse);
  const navigate = useNavigate();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const owner_emails = emails.map((x) => x.value.trim()).filter(Boolean);
    try {
      const result = await createCourse({
        slug: slug.trim(),
        display_name: displayName.trim(),
        semester_name: semesterName.trim(),
        owner_emails,
      });
      // User is already signed in (we gate the form on auth). Navigate directly
      // to the new course's settings — no second OAuth round-trip needed.
      navigate(`/${result.slug}/settings`);
    } catch (err: any) {
      setError(err?.data?.message || err?.message || 'Failed to create course');
    }
  }

  if (isLoading) {
    return (
      <Container sx={{ py: 4, maxWidth: 600 }}>
        <Typography>Loading…</Typography>
      </Container>
    );
  }

  if (!isAuthenticated) {
    return (
      <Container sx={{ py: 4, maxWidth: 600 }}>
        <Typography variant="h4">Create New Course</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Sign in with Google before creating a course. Your account doesn't need to be an owner —
          you'll specify the owner emails on the next screen.
        </Typography>
        <Button
          variant="contained"
          sx={{ mt: 3 }}
          onClick={() =>
            signIn('google', {
              redirectTo: `${import.meta.env.BASE_URL || '/'}create`,
            })
          }
        >
          Sign in with Google
        </Button>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4, maxWidth: 600 }}>
      <Typography variant="h4">Create New Course</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        After submitting, you'll be taken to the course's settings page. Make sure your email is one
        of the owner emails if you want admin access.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={onSubmit}>
        <Stack spacing={2} sx={{ mt: 3 }}>
          <TextField
            label="Slug (URL identifier, e.g. cs15122)"
            required
            inputProps={{ pattern: '[a-z0-9-]+' }}
            helperText="Lowercase letters, digits, hyphens only"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
          />
          <TextField
            label="Course Display Name"
            required
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
          <TextField
            label="Semester Name (e.g. S26)"
            required
            value={semesterName}
            onChange={(e) => setSemesterName(e.target.value)}
          />

          <Typography variant="subtitle1" sx={{ mt: 1 }}>
            Owner Emails
          </Typography>
          {emails.map((em, i) => (
            <Stack key={em.id} direction="row" spacing={1}>
              <TextField
                label={`Owner ${i + 1}`}
                type="email"
                required
                fullWidth
                value={em.value}
                onChange={(e) =>
                  setEmails(
                    emails.map((x) =>
                      x.id === em.id ? { ...x, value: e.target.value } : x,
                    ),
                  )
                }
              />
              <IconButton
                onClick={() =>
                  emails.length > 1 && setEmails(emails.filter((x) => x.id !== em.id))
                }
                disabled={emails.length === 1}
                aria-label="remove"
              >
                <Delete />
              </IconButton>
            </Stack>
          ))}
          <Button
            startIcon={<Add />}
            onClick={() => {
              setEmails([...emails, { id: nextId, value: '' }]);
              setNextId(nextId + 1);
            }}
            sx={{ alignSelf: 'flex-start' }}
          >
            Add Owner
          </Button>

          <Button type="submit" variant="contained" sx={{ mt: 2 }}>
            Create Course
          </Button>
        </Stack>
      </form>
    </Container>
  );
}
