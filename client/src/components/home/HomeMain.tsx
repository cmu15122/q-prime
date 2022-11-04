import React, {useState, useEffect} from 'react';

import SharedMain from './shared/SharedMain';
import StudentMain from './student/StudentMain';
import TAMain from './ta/TAMain';
import Footer from './Footer';
import {Container} from '@mui/material';

import {socketSubscribeTo} from '../../services/SocketsService';

function HomeMain(props) {
  const {queueData, studentData} = props;

  const gitHubLink = 'https://github.com/cmu15122/q-issues/issues';

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isTA, setIsTA] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [queueFrozen, setQueueFrozen] = useState(true);
  const [mainPage, setMainPage] = useState(null);

  useEffect(() => {
    socketSubscribeTo('queueFrozen', (data) => {
      setQueueFrozen(data.isFrozen);
    });
  }, []);

  useEffect(() => {
    if (queueData != null) {
      setIsAuthenticated(queueData.isAuthenticated);
      setIsTA(queueData.isTA);
      setIsAdmin(queueData.isAdmin);
      setQueueFrozen(queueData.queueFrozen);
    }
  }, [queueData]);

  useEffect(() => {
    if (isAuthenticated) {
      if (isTA) {
        setMainPage(<TAMain queueData={queueData} />);
      } else { // is student
        setMainPage(<StudentMain queueData={queueData} queueFrozen={queueFrozen} studentData={studentData} />);
      }
    } else {
      // you are not logged in
      setMainPage(null);
    }
  }, [isAuthenticated, isTA, isAdmin, queueFrozen, queueData, studentData]);

  return (
    <Container sx={{display: 'flex', minHeight: '100vh', flexDirection: 'column'}}>
      <SharedMain
        queueData={queueData}
        queueFrozen={queueFrozen}
        setQueueFrozen={setQueueFrozen}
      />
      {mainPage}
      <Footer gitHubLink={gitHubLink}/>
    </Container>
  );
}

export default HomeMain;
