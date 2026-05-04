import { useEffect, useState } from 'react';
import { Container, TextField, Button, Typography, Stack, IconButton, Alert } from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useConvexAuth, useMutation, useQuery } from 'convex/react';
import { useAuthActions } from '@convex-dev/auth/react';
import { api } from '../../convex/_generated/api';

export default function CreateCoursePage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signIn } = useAuthActions();

  // Skip the query when not authenticated — convex returns undefined for skipped queries.
  const ownedCourse = useQuery(api.courses.getMyOwnedCourse, isAuthenticated ? {} : 'skip');
  const navigate = useNavigate();

  useEffect(() => {
    if (ownedCourse) {
      navigate(`/${ownedCourse.slug}`, { replace: true });
    }
  }, [ownedCourse, navigate]);

  const [slug, setSlug] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [semesterName, setSemesterName] = useState('');
  const [emails, setEmails] = useState([{ id: 0, value: '' }]);
  const [nextId, setNextId] = useState(1);
  const [error, setError] = useState<string | null>(null);
  // Per-course branding. Defaults match the standard forest + amber tokens —
  // anyone fine with the defaults can ignore these inputs.
  const [themePrimary, setThemePrimary] = useState('#14532D');
  const [themeSecondary, setThemeSecondary] = useState('#EAB308');

  const createCourse = useMutation(api.courses.createCourse);

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
        // Only send if the user changed off the defaults; otherwise omit so
        // the server stores `undefined` and falls back to the defaults at
        // /_theme/<slug>.css render time.
        theme_primary: themePrimary !== '#14532D' ? themePrimary : undefined,
        theme_secondary: themeSecondary !== '#EAB308' ? themeSecondary : undefined,
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

  if (isAuthenticated && ownedCourse) {
    return (
      <Container sx={{ py: 4, maxWidth: 600 }}>
        <Typography>
          You already own <strong>{ownedCourse.display_name}</strong>. Taking you there…
        </Typography>
      </Container>
    );
  }

  if (!isAuthenticated) {
    return (
      <Container sx={{ py: 4, maxWidth: 600 }}>
        <Typography variant="h4">Create New Course</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Sign in with Google before creating a course. Your account will be the course owner —
          you'll add other owner emails on the next screen.
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
                    emails.map((x) => (x.id === em.id ? { ...x, value: e.target.value } : x)),
                  )
                }
              />
              <IconButton
                onClick={() => emails.length > 1 && setEmails(emails.filter((x) => x.id !== em.id))}
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

          <Typography variant="subtitle1" sx={{ mt: 2 }}>
            Theme colors{' '}
            <Typography component="span" variant="caption" color="text.secondary">
              (optional — change later in admin settings)
            </Typography>
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <Stack direction="row" spacing={1} alignItems="center" sx={{ flex: 1 }}>
              <input
                type="color"
                value={themePrimary}
                onChange={(e) => setThemePrimary(e.target.value)}
                style={{
                  width: 44,
                  height: 44,
                  border: 'none',
                  background: 'none',
                  padding: 0,
                  cursor: 'pointer',
                }}
                aria-label="Primary color"
              />
              <TextField
                label="Primary"
                value={themePrimary}
                onChange={(e) => setThemePrimary(e.target.value)}
                inputProps={{ pattern: '#[0-9a-fA-F]{6}' }}
                size="small"
                sx={{ flex: 1 }}
              />
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ flex: 1 }}>
              <input
                type="color"
                value={themeSecondary}
                onChange={(e) => setThemeSecondary(e.target.value)}
                style={{
                  width: 44,
                  height: 44,
                  border: 'none',
                  background: 'none',
                  padding: 0,
                  cursor: 'pointer',
                }}
                aria-label="Secondary color"
              />
              <TextField
                label="Secondary"
                value={themeSecondary}
                onChange={(e) => setThemeSecondary(e.target.value)}
                inputProps={{ pattern: '#[0-9a-fA-F]{6}' }}
                size="small"
                sx={{ flex: 1 }}
              />
            </Stack>
          </Stack>

          <Button type="submit" variant="contained" sx={{ mt: 2 }}>
            Create Course
          </Button>
        </Stack>
      </form>
    </Container>
  );
}
