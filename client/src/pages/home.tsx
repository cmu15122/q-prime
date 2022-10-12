import { useState, useEffect } from 'react';
import { useTheme } from '@mui/material';

import Navbar from '../components/navbar/Navbar';
import HomeMain from '../components/home/HomeMain';

import HomeService from "../services/HomeService";
import { initiateSocket } from '../services/SocketsService';

function Home(props) {
    const theme = useTheme();
    const [queueData, setQueueData] = useState(null);
    const [studentData, setStudentData] = useState(null);

    useEffect(() => {
        HomeService.getAll()
        .then(res => {
            setQueueData(res.data.queueData);
            setStudentData(res.data.studentData)
            document.title = res.data.queueData.title;
        });
        
        initiateSocket();
    }, []);

    return (
        <div className="App" style={{backgroundColor: theme.palette.background.default}}>
            <Navbar queueData={queueData} isHome={true} studentData={studentData} />
            {
                queueData && 
                <HomeMain 
                    queueData={queueData}
                    studentData={studentData}
                />
            }
        </div>
    );
}

export default Home;
    