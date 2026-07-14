import Navbar from '../components/navbar/Navbar';
import SqlQueryMain from '../components/sqlQuery/SqlQueryMain';

import { useTheme } from '@mui/material/styles';
import { Alert, Box, CircularProgress, Typography } from '@mui/material';
import { Navigate } from 'react-router-dom';

import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

/**
 * Admin-only SQL query page. Gated on env var, runtime setting, and admin role.
 */
function SqlQuery() {
  const theme = useTheme();
  const userData = useQuery(api.home.home_get.getUserData);
  const status = useQuery(api.sqlQuery.sqlQuery_get.getSqlModuleStatus);

  const isLoading = userData === undefined || status === undefined;
  const isAuthenticated = userData !== null && userData !== undefined;

  if (isLoading) {
    return <CircularProgress />;
  }

  if (!isAuthenticated) {
    return <Navigate to={{ pathname: '/' }} />;
  }

  if (!status.isAdmin) {
    return <Navigate to={{ pathname: '/' }} />;
  }

  // admin, but module disabled → show explanatory page
  if (!status.envEnabled) {
    return (
      <div style={{ backgroundColor: theme.palette.background.default, minHeight: '100vh' }}>
        <Navbar isHome={false} />
        <Box sx={{ px: 3, py: 4 }}>
          <Typography variant="h4" fontWeight="bold" sx={{ mb: 2 }}>
            SQL Query
          </Typography>
          <Alert severity="warning">
            The SQL module is disabled in this deployment. Set{' '}
            <code>SQL_MODULE_ENABLED=true</code> on the Convex backend (
            <code>npx convex env set SQL_MODULE_ENABLED true</code>) to enable it.
          </Alert>
        </Box>
      </div>
    );
  }

  if (!status.settingEnabled) {
    return (
      <div style={{ backgroundColor: theme.palette.background.default, minHeight: '100vh' }}>
        <Navbar isHome={false} />
        <Box sx={{ px: 3, py: 4 }}>
          <Typography variant="h4" fontWeight="bold" sx={{ mb: 2 }}>
            SQL Query
          </Typography>
          <Alert severity="warning">
            The SQL module is disabled in settings. Enable &ldquo;SQL Query Module&rdquo; in
            Admin Settings to use it.
          </Alert>
        </Box>
      </div>
    );
  }

  return (
    <div
      className="SqlQuery"
      style={{ backgroundColor: theme.palette.background.default, minHeight: '100vh' }}
    >
      <Navbar isHome={false} />
      <SqlQueryMain />
    </div>
  );
}

export default SqlQuery;
