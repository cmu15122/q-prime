import React, {useState, useEffect} from 'react';

import SharedMain from './shared/SharedMain';
import StudentMain from './student/StudentMain';
import TAMain from './ta/TAMain';
import Footer from './Footer';
import {Container} from '@mui/material';

import {socketSubscribeTo} from '../../services/SocketsService';
import {useQueueDataContext} from '../../App';

function HomeMain() {
  const {queueData, setQueueData} = useQueueDataContext();

  const gitHubLink = 'https://github.com/cmu15122/q-issues/issues';

  const [mainPage, setMainPage] = useState(null);

  useEffect(() => {
    socketSubscribeTo('queueFrozen', (data) => {
      setQueueData({...queueData, queueFrozen: data.isFrozen});
    });
  }, []);

  useEffect(() => {
    if (queueData.isAuthenticated) {
      if (queueData.isTA) {
        setMainPage(<TAMain/>);
      } else { // is student
        setMainPage(<StudentMain/>);
      }
    } else {
      // you are not logged in
      setMainPage(null);
    }
  }, [queueData.isAuthenticated, queueData.isTA]);

  return (
    <Container sx={{display: 'flex', minHeight: '100vh', flexDirection: 'column'}}>
      <SharedMain/>
      {mainPage}
      <Footer gitHubLink={gitHubLink}/>
    </Container>
  );
}

export default HomeMain;
