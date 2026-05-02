import { Container, Stack, Typography, Button, Card, CardContent } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

export default function CourseListPage() {
  const courses = useQuery(api.courses.listCourses);

  return (
    <Container sx={{ py: 4, maxWidth: 720 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4">Office Hours Courses TEST</Typography>
        <Button component={RouterLink} to="/create" variant="contained">
          Create New Course
        </Button>
      </Stack>
      {courses === undefined ? (
        <Typography>Loading…</Typography>
      ) : courses.length === 0 ? (
        <Typography color="text.secondary">No courses yet. Create one to get started.</Typography>
      ) : (
        <Stack spacing={2}>
          {courses.map((c) => (
            <Card key={c._id}>
              <CardContent>
                <RouterLink to={`/${c.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <Typography variant="h6">{c.display_name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    /{c.slug}
                  </Typography>
                </RouterLink>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Container>
  );
}
