import React, {useContext} from 'react';

import Navbar from '../components/navbar/Navbar';
import MetricsMain from '../components/metrics/MetricsMain';

import {useTheme} from '@mui/material/styles';
import {CircularProgress} from '@mui/material';
import {Navigate} from 'react-router-dom';

import {UserDataContext} from '../contexts/UserDataContext';

/**
 * Metrics page, only accessible to TAs
 * @return {JSX.Element} Metrics page
 */
function Metrics() {
  const theme = useTheme();
  const {userData, isLoadingUserData} = useContext(UserDataContext);

  return (
    (isLoadingUserData) ? (
      <CircularProgress />
    ) :
    (
      (userData.isAuthenticated && userData.isTA) ? (
        <div className="Metrics" style={{backgroundColor: theme.palette.background.default}}>
          <Navbar askQuestionOrYourEntry={true}/>
          <MetricsMain/>
        </div>
      ) : (
        <Navigate to={{pathname: '/'}} />
      )
    )
  );
}

export default Metrics;
