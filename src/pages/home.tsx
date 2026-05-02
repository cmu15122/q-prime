import { useTheme } from '@mui/material';

import Navbar from '../components/navbar/Navbar';
import HomeMain from '../components/home/HomeMain';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useCourseId } from '../contexts/CourseContext';

/**
 * Home page
 * @return {JSX.Element} Home page
 */
function Home() {
  const theme = useTheme();
  const courseId = useCourseId();

  useQuery(api.home.home_get.getQueueData, { courseId });

  return (
    <div className="App" style={{ backgroundColor: theme.palette.background.default }}>
      <Navbar isHome={true} />
      <HomeMain />
    </div>
  );
}

export default Home;
