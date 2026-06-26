import { useState, useEffect } from 'react';

import SharedMain from './shared/SharedMain';
import StudentMain from './student/StudentMain';
import TAMain from './ta/TAMain';
import Footer from './Footer';
import { Container, Typography } from '@mui/material';

import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import ConvexNotifHandler from '../common/ConvexNotifHandler';
import { useCourseId } from '../../contexts/CourseContext';

function HomeMain() {
  const gitHubLink = 'https://github.com/cmu15122/q-issues/issues';
  const courseId = useCourseId();

  const [mainPage, setMainPage] = useState<JSX.Element | null>(null);

  const userData = useQuery(api.home.home_get.getUserData, { courseId });
  const queueData = useQuery(api.home.home_get.getQueueData, { courseId });
  const isAuthenticated = userData !== null && userData !== undefined;
  const isTA = isAuthenticated && userData.user_kind === 'TA';

  useEffect(() => {
    if (!('Notification' in window)) {
      console.log('This browser does not support desktop notification');
    } else if (Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && userData?.valid_email) {
      if (isTA) {
        setMainPage(<TAMain />);
      } else {
        // is student
        setMainPage(<StudentMain />);
      }
    } else if (userData?.valid_email) {
      // you are not logged in
      setMainPage(null);
    } else if (userData) {
      setMainPage((
        <Typography variant="h3" sx={{ textAlign: 'center', p: 4 }}>
          Please log in with an email account ending with:{' '}
          {queueData?.allowed_email_domains.join(', ')}
        </Typography>
      ));
    } else {
      setMainPage((<></>));
    }
  }, [isAuthenticated, isTA]);

  return (
    <>
      <ConvexNotifHandler />
      <Container sx={{ display: 'flex', flex: 1, flexDirection: 'column' }}>
        <SharedMain />
        {mainPage}
        <Footer gitHubLink={gitHubLink} />
      </Container>
    </>
  );
}

export default HomeMain;
