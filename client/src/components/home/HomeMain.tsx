import React, {useState, useEffect, useContext} from 'react';

import SharedMain from './shared/SharedMain';
import StudentMain from './student/StudentMain';
import TAMain from './ta/TAMain';
import Footer from './Footer';
import {Container} from '@mui/material';

import {UserDataContext} from '../../contexts/UserDataContext';

function HomeMain() {
  const {userData} = useContext(UserDataContext);

  const gitHubLink = 'https://github.com/cmu15122/q-issues/issues';

  const [mainPage, setMainPage] = useState(null);

  useEffect(() => {
    if (!('Notification' in window)) {
      console.log('This browser does not support desktop notification');
    } else if (Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (userData.isAuthenticated) {
      if (userData.isTA) {
        setMainPage(<TAMain/>);
      } else { // is student
        setMainPage(<StudentMain/>);
      }
    } else {
      // you are not logged in
      setMainPage(null);
    }
  }, [userData.isAuthenticated, userData.isTA]);

  return (
    <Container sx={{display: 'flex', minHeight: '100vh', flexDirection: 'column'}}>
      <SharedMain/>
      {mainPage}
      <Footer gitHubLink={gitHubLink}/>
    </Container>
  );
}

export default HomeMain;
