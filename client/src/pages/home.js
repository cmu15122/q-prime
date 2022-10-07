import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import Navbar from '../components/navbar/Navbar';
import HomeMain from '../components/home/HomeMain';

import HomeService from "../services/HomeService";
import { showErrorToast } from "../services/ToastService";
import { initiateSocket } from '../services/SocketsService';

function Home(props) {
    const { theme } = props;
    const [queueData, setQueueData] = useState(null);
    const [studentData, setStudentData] = useState(null);

    const paramsString = useLocation().search;
    const params = new URLSearchParams(paramsString); 
    const message = params.get('message');

    useEffect(() => {
        HomeService.getAll()
            .then(res => {
                setQueueData(res.data.queueData);
                setStudentData(res.data.studentData)
                document.title = res.data.queueData.title;
            });

        initiateSocket();
    }, [message]);

    useEffect(() => {
        if (message != null) {
            showErrorToast(message);
        }
    }, [message]);

    return (
        <div className="App" style={{backgroundColor: theme.palette.background.default}}>
            <Navbar theme={theme} queueData={queueData} isHome={true} studentData={studentData} />
            {
                queueData && 
                <HomeMain 
                    theme={theme}
                    queueData={queueData}
                    studentData={studentData}
                />
            }
        </div>
    );
}

export default Home;
    