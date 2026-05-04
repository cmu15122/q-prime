import { Navigate } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import CreateCoursePage from './CreateCoursePage';

export default function SingleCourseCreateGuard() {
  const first = useQuery(api.courses.getFirstCourse);
  if (first === undefined) return null;
  if (first) return <Navigate to={`/${first.slug}`} replace />;
  return <CreateCoursePage />;
}
