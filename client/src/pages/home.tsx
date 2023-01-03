import React, {useContext, useEffect} from 'react';
import {useTheme} from '@mui/material';

import Navbar from '../components/navbar/Navbar';
import HomeMain from '../components/home/HomeMain';

import HomeService from '../services/HomeService';
import {initiateSocket} from '../services/SocketsService';
import {QueueDataContext, StudentDataContext} from '../App';


function Home(props) {
  const theme = useTheme();

  const {queueData, setQueueData} = useContext(QueueDataContext);
  const {studentData, setStudentData} = useContext(StudentDataContext);

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
