import React, {useState, useEffect, useContext, createContext} from 'react';
import {useTheme} from '@mui/material';

import Navbar from '../components/navbar/Navbar';
import HomeMain from '../components/home/HomeMain';

import HomeService from '../services/HomeService';
import {initiateSocket} from '../services/SocketsService';
import {useQueueDataContext} from '../App';

type StudentDataContent = {
  name?: string,
  andrewID?: string,
  taID?: number,
  taAndrewID?: string,
  location?: string,
  topic?: string,
  question?: string,
  status?: number,
  isFrozen?: boolean,
  message?: string,
  messageBuffer?: string[],
  position?: number,
  helpingTA?: {
    taId: number,
    taName: string,
    taZoomUrl: string,
  }
}

type StudentDataContextContent = {
  studentData: StudentDataContent
  setStudentData: React.Dispatch<React.SetStateAction<StudentDataContent>>
}

let StudentDataContext: React.Context<StudentDataContextContent>;
let useStudentDataContext: () => StudentDataContextContent;

function Home(props) {
  const theme = useTheme();
  const [studentData, setStudentData] = useState({});

  const {queueData, setQueueData} = useQueueDataContext();

  StudentDataContext = createContext<StudentDataContextContent>({
    studentData: studentData,
    setStudentData: setStudentData,
  });
  useStudentDataContext = () => useContext(StudentDataContext);


  useEffect(() => {
    if (queueData.frontendInitialized === false) {
      HomeService.getAll()
          .then((res) => {
            setQueueData({...res.data.queueData, frontendInitialized: true});
            setStudentData(res.data.studentData);
            document.title = res.data.queueData.title;
          });

      initiateSocket();
    }
  }, []);

  return (
    <div className="App" style={{backgroundColor: theme.palette.background.default}}>
      <Navbar isHome={true}/>
      {
        queueData &&
          <HomeMain/>
      }
    </div>
  );
}

export {
  StudentDataContext,
  useStudentDataContext,
};

export default Home;
