import React, {useContext, useEffect} from 'react';

import Navbar from '../components/navbar/Navbar';
import MetricsMain from '../components/metrics/MetricsMain';

import MetricsDataService from '../services/MetricsService';
import {useTheme} from '@mui/material/styles';
import { QueueDataContext } from '../App';

function Metrics() {
  const theme = useTheme();

  const {queueData, setQueueData} = useContext(QueueDataContext);

  // useEffect(() => {
  //   if (queueData.frontendInitialized === false) {
  //     MetricsDataService.getAll()
  //         .then((res) => {
  //           setQueueData({...res.data, frontendInitialized: true});
  //           document.title = res.data.title;
  //         });
  //   }
  // }, []);

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
