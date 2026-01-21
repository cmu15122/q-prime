import React from 'react';

import Navbar from '../components/navbar/Navbar';
import MetricsMain from '../components/metrics/MetricsMain';

import {useTheme} from '@mui/material/styles';
import {CircularProgress} from '@mui/material';
import {Navigate} from 'react-router-dom';

import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

/**
 * Metrics page, only accessible to TAs
 * @return {JSX.Element} Metrics page
 */
function Metrics() {
  const theme = useTheme();
  const userData = useQuery(api.home.home_get.getUserData)

  const isLoadingUserData = userData === undefined;
  const isAuthenticated = (userData !== null && userData !== undefined)
  const isTA = isAuthenticated && userData.user_kind === 'TA'

  return (
    (isLoadingUserData) ? (
      <CircularProgress />
    ) :
    (
      (isAuthenticated && isTA) ? (
        <div className="Metrics" style={{backgroundColor: theme.palette.background.default}}>
          <Navbar isHome={false}/>
          <MetricsMain/>
        </div>
      ) : (
        <Navigate to={{pathname: '/'}} />
      )
    )
  );
}

export default Metrics;
