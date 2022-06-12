import React, { useState, useEffect } from 'react';
import SharedMain from './shared/SharedMain';
import StudentMain from './student/StudentMain';
import TAMain from './ta/TAMain';

function HomeMain (props) {
    const { theme, queueData } = props;
    
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isTA, setIsTA] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [mainPage, setMainPage] = useState();

    useEffect(() => {
        if (queueData != null) {
            setIsAuthenticated(queueData.isAuthenticated);
            setIsTA(queueData.isTA);
            setIsAdmin(queueData.isAdmin);
        }
    }, [queueData]);

    useEffect(() => {
        if (isAuthenticated) {
            if (isTA) {
                setMainPage(<TAMain theme={theme} queueData={queueData} />);
            }
            else {
                setMainPage(<StudentMain theme={theme} queueData={queueData} />);
            }
        }
    }, [isAuthenticated, isTA, isAdmin]);

    return (
      <div>
          <SharedMain
            theme={theme}
            queueData={queueData}
          />
          {mainPage}
      </div>
    );
}
  
export default HomeMain;
