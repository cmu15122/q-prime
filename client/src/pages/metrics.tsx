import React, {useState, useEffect} from 'react';

import Navbar from '../components/navbar/Navbar';
import MetricsMain from '../components/metrics/MetricsMain';

import MetricsDataService from '../services/MetricsService';
import {useTheme} from '@mui/material/styles';

function Metrics() {
  const theme = useTheme();

  const [queueData, setQueueData] = useState(null);

  useEffect(() => {
    MetricsDataService.getAll()
        .then((res) => {
          setQueueData(res.data);
          document.title = res.data.title;
        });
  }, []);

  return (
    <div className="Metrics" style={{backgroundColor: theme.palette.background.default}}>
      <Navbar queueData={queueData} askQuestionOrYourEntry={true}/>
      {
        queueData != null &&
          <MetricsMain queueData={queueData}/>
      }
    </div>
  );
}

export default Metrics;
