import React, {useState, useEffect, useContext} from 'react';

import Navbar from '../components/navbar/Navbar';
import MetricsMain from '../components/metrics/MetricsMain';

import MetricsDataService from '../services/MetricsService';
import {useTheme} from '@mui/material/styles';
import {QueueDataContext, useQueueDataContext} from '../App';

function Metrics() {
  const theme = useTheme();

  const {queueData, setQueueData} = useQueueDataContext();

  useEffect(() => {
    if (queueData.title == 'UNINITIALIZED') {
      MetricsDataService.getAll()
          .then((res) => {
            setQueueData(res.data);
            document.title = res.data.title;
          });
    }
  }, []);

  return (
    <div className="Metrics" style={{backgroundColor: theme.palette.background.default}}>
      <Navbar askQuestionOrYourEntry={true}/>
      {
        queueData != null &&
          <MetricsMain/>
      }
    </div>
  );
}

export default Metrics;
