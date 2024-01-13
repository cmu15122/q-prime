import React, {useContext} from 'react';
import {
  Typography,
} from '@mui/material';

import PersonalStats from './PersonalStats';
import OverallStats from './OverallStats';
import CumulativeStats from './CumulativeStats';
import Graph from './Graph';
import {UserDataContext} from '../../contexts/UserDataContext';
import AdminMetrics from './AdminMetrics';

export default function MetricsMain(props) {
  const {userData} = useContext(UserDataContext);

  return (
    <div>
      <Typography variant="h3" textAlign='center' sx={{mt: 4}} fontWeight='bold'>
        Metrics
      </Typography>
      <PersonalStats/>

      <OverallStats/>
      <CumulativeStats/>
      <Graph/>

      {
        userData.isAdmin && <AdminMetrics/>
      }
    </div>
  );
}
