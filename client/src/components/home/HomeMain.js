import React, { useState, useEffect } from 'react';
import SharedMain from './shared/SharedMain';
import StudentMain from './student/StudentMain';
import TAMain from './ta/TAMain';
import Footer from './Footer';

function HomeMain (props) {
    const { theme, queueData } = props;

    const gitHubLink = 'https://www.github.com'
    
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isTA, setIsTA] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [queueFrozen, setQueueFrozen] = useState(true);
    const [mainPage, setMainPage] = useState();

    useEffect(() => {
        if (queueData != null) {
            setIsAuthenticated(queueData.isAuthenticated);
            setIsTA(queueData.isTA);
            setIsAdmin(queueData.isAdmin);
            setQueueFrozen(queueData.queueFrozen);
        }
    }, [queueData]);

    useEffect(() => {
        if (queueFrozen) {
            setMainPage();
        } else if (isAuthenticated) {
            if (isTA) {
                setMainPage(<TAMain theme={theme} queueData={queueData} />);
                console.log('in TA');
            }
            else {
                setMainPage(<StudentMain theme={theme} queueData={queueData} />);
            }
        } else {
            // queue is open and you are not logged in
            setMainPage();
        }
    }, [isAuthenticated, isTA, isAdmin, queueFrozen, queueData]);

    return (
      <div>
          <SharedMain
            theme={theme}
            queueData={queueData}
            queueFrozen={queueFrozen}
            setQueueFrozen={setQueueFrozen}
          />
          {mainPage}
          <Footer gitHubLink={gitHubLink} />
      </div>
    );
}
  
export default HomeMain;
