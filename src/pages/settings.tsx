import Navbar from '../components/navbar/Navbar';
import SettingsMain from '../components/settings/SettingsMain';

import { useTheme } from '@mui/material/styles';
import { CircularProgress, Typography } from '@mui/material';

import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useCourseId } from '../contexts/CourseContext';

/**
 * Settings page, only accessible to TAs and course owners
 * @return {JSX.Element} Settings page
 */
function Settings() {
  const theme = useTheme();
  const courseId = useCourseId();
  const userData = useQuery(api.home.home_get.getUserData, { courseId });

  const isLoadingUserData = userData === undefined;
  const isAuthenticated = userData !== null && userData !== undefined;
  const isTA = isAuthenticated && userData.user_kind === 'TA';

  return isLoadingUserData ? (
    <CircularProgress />
  ) : isAuthenticated && (isTA || userData.is_owner) ? (
    <div className="Settings" style={{ backgroundColor: theme.palette.background.default }}>
      <Navbar isHome={false} />
      <SettingsMain />
    </div>
  ) : (
    <>
      <Typography variant="body1">
        You must be signed in as a TA to view the settings page.
      </Typography>
    </>
  );
}

export default Settings;
