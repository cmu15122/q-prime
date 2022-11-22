import React, {useState, useEffect} from 'react';

import SharedMain from './shared/SharedMain';
import StudentMain from './student/StudentMain';
import TAMain from './ta/TAMain';
import Footer from './Footer';
import {Container} from '@mui/material';

import {socketSubscribeTo} from '../../services/SocketsService';
import {useQueueDataContext} from '../../App';
import {useStudentDataContext} from '../../pages/home';

function HomeMain() {
  const {studentData} = useStudentDataContext();
  const {queueData} = useQueueDataContext();

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
  }, [queueData.isAuthenticated, queueData.isTA, queueData.isAdmin, queueData.queueFrozen]);

  useEffect(() => {
    if (isAuthenticated) {
      if (isTA) {
        setMainPage(<TAMain/>);
      } else { // is student
        setMainPage(<StudentMain queueFrozen={queueFrozen}/>);
      }
    } else {
      // you are not logged in
      setMainPage(null);
    }
  }, [isAuthenticated, isTA, queueFrozen, studentData]);

  return (
    <Container sx={{display: 'flex', minHeight: '100vh', flexDirection: 'column'}}>
      <SharedMain
        queueFrozen={queueFrozen}
        setQueueFrozen={setQueueFrozen}
      />
      {mainPage}
      <Footer gitHubLink={gitHubLink}/>
    </Container>
  );
}

export default HomeMain;
