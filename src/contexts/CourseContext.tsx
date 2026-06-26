import { createContext, useContext, useEffect, useState } from 'react';
import { Outlet, useParams, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useConvexAuth, useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { CourseAwareThemeProvider } from './CourseColorContext';

type CourseContextValue = {
  courseId: Id<'courses'>;
  courseSlug: string;
  displayName: string;
};

const CourseContext = createContext<CourseContextValue | null>(null);

export function useCourseId(): Id<'courses'> {
  const ctx = useContext(CourseContext);
  if (!ctx) throw new Error('useCourseId must be used inside <CourseScope>');
  return ctx.courseId;
}

export function useCourseSlug(): string {
  const ctx = useContext(CourseContext);
  if (!ctx) throw new Error('useCourseSlug must be used inside <CourseScope>');
  return ctx.courseSlug;
}

export function useCourseInfo(): CourseContextValue {
  const ctx = useContext(CourseContext);
  if (!ctx) throw new Error('useCourseInfo must be used inside <CourseScope>');
  return ctx;
}

function Spinner() {
  return (
    <Box
      sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}
    >
      <CircularProgress />
    </Box>
  );
}

export default function CourseScope() {
  const { classSlug } = useParams<{ classSlug: string }>();
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const course = useQuery(api.courses.getCourseBySlug, classSlug ? { slug: classSlug } : 'skip');
  const enroll = useMutation(api.home.home_mutate.enrollInCourse);

  // Track per-course enrollment so children don't render until the user has a
  // semesterUser row. Without this, pages that gate on user_kind/is_owner flash
  // an "unauthorized" error in the window between sign-in and enrollment.
  const [enrolledCourseId, setEnrolledCourseId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !course?._id) return;
    if (!isAuthenticated) {
      // Not signed in — no enrollment needed; render the public/anonymous view.
      setEnrolledCourseId(course._id);
      return;
    }
    if (enrolledCourseId === course._id) return;
    enroll({ courseId: course._id })
      .then(() => setEnrolledCourseId(course._id))
      .catch((err) => {
        console.warn('enrollInCourse failed:', err);
        setEnrolledCourseId(course._id); // unblock so the page can render anyway
      });
  }, [authLoading, isAuthenticated, course?._id]);

  if (authLoading || course === undefined) return <Spinner />;
  if (course === null) return <Navigate to="/" replace />;
  if (enrolledCourseId !== course._id) return <Spinner />;

  return (
    <CourseContext.Provider
      value={{
        courseId: course._id,
        courseSlug: course.slug,
        displayName: course.display_name,
      }}
    >
      <CourseAwareThemeProvider>
        <Outlet />
      </CourseAwareThemeProvider>
    </CourseContext.Provider>
  );
}
