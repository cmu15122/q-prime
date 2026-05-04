import { Navigate } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

export default function SingleCourseRoot() {
  const first = useQuery(api.courses.getFirstCourse);
  if (first === undefined) return null;
  return <Navigate to={first ? `/${first.slug}` : '/create'} replace />;
}
