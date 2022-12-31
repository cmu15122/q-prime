import React, {useEffect} from 'react';
import {useTheme} from '@mui/material';

import Navbar from '../components/navbar/Navbar';
import HomeMain from '../components/home/HomeMain';

import HomeService from '../services/HomeService';
import {initiateSocket} from '../services/SocketsService';
import {useQueueDataContext, useStudentDataContext} from '../App';


function Home(props) {
  const theme = useTheme();

  const {queueData, setQueueData} = useQueueDataContext();
  const {studentData, setStudentData} = useStudentDataContext();

  useEffect(() => {
    if (queueData.frontendInitialized === false) {
      HomeService.getAll()
          .then((res) => {
            setQueueData({...res.data, frontendInitialized: true});
            // setStudentData(res.data.studentData);
            document.title = res.data.title;
          });

      initiateSocket();
    }
  }, []);

  useEffect(() => {
    if (!queueData.isTA && studentData.frontendInitialized === false) {
      HomeService.getStudentData()
          .then((res) => {
            setStudentData({...res.data, frontendInitialized: true});
          });
    }
  }, [queueData.isTA]);

  return (
    <div className="App" style={{backgroundColor: theme.palette.background.default}}>
      <Navbar isHome={true}/>
      {
        queueData &&
          <HomeMain/>
      }
    </div>
  );
}

export default Home;
