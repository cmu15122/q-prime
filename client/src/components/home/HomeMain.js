import React, { useState, useEffect } from 'react';

import SharedMain from './shared/SharedMain';
import StudentMain from './student/StudentMain';
import TAMain from './ta/TAMain';
import Footer from './Footer';

import { socketSubscribeTo } from '../../services/SocketsService';

function HomeMain (props) {
    const { theme, queueData, studentData } = props;

    const gitHubLink = 'https://www.github.com'
    
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isTA, setIsTA] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [queueFrozen, setQueueFrozen] = useState(true);
    const [mainPage, setMainPage] = useState();

    useEffect(() => {
        socketSubscribeTo("queueFrozen", (data) => {
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
                setMainPage(<TAMain theme={theme} queueData={queueData} />);
            }
            else { // is student
                if (queueFrozen) {
                    setMainPage();
                } else {
                    setMainPage(<StudentMain theme={theme} queueData={queueData} studentData={studentData} />);
                }
            }
        } else {
            // queue is open and you are not logged in
            setMainPage();
        }
    }, [isAuthenticated, isTA, isAdmin, queueFrozen, queueData, studentData, theme]);

    return (
      <div style={{backgroundColor: theme.palette.background.default}}>
          <SharedMain
            theme={theme}
            queueData={queueData}
            queueFrozen={queueFrozen}
            setQueueFrozen={setQueueFrozen}
          />
          {mainPage}
          <Footer gitHubLink={gitHubLink} theme={theme}/>
      </div>
    );
}
  
export default HomeMain;
