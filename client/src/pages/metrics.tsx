import React from 'react';

import Navbar from '../components/navbar/Navbar';
import MetricsMain from '../components/metrics/MetricsMain';

import {useTheme} from '@mui/material/styles';

function Metrics() {
  const theme = useTheme();

  return (
    <div className="Metrics" style={{backgroundColor: theme.palette.background.default}}>
      <Navbar askQuestionOrYourEntry={true}/>
      <MetricsMain/>
    </div>
  );
}

export default Metrics;
