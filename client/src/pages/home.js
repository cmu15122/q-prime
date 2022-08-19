import React, { useState, useEffect } from 'react';

import Navbar from '../components/navbar/Navbar';
import HomeMain from '../components/home/HomeMain';

import HomeService from "../services/HomeService";
import { initiateSocket } from '../services/SocketsService';

function Home(props) {
  const { theme } = props;
  const [queueData, setQueueData] = useState(null);
  const [studentData, setStudentData] = useState(null);

  useEffect(() => {
    HomeService.getAll()
      .then(res => {
        // TODO: Queue data doesn't get updated on student's page when they add themselves to the queue without a reload
        setQueueData(res.data.queueData);
        setStudentData(res.data.studentData)
        document.title = res.data.queueData.title;
      });
    
    initiateSocket();
  }, []);

  return (
    <div className="App" style={{backgroundColor: theme.palette.background.default}}>
        <Navbar theme={theme} queueData={queueData} isHome={true} studentData={studentData} />
        <HomeMain 
          theme={theme}
          queueData={queueData}
          studentData={studentData}
        />
    </div>
  );
}

export default Home;
    