// TODO: Bug where setting preferred name as student causes crash and reload
// TODO: Standardize queueData.locations
// TODO: Where does TAHelping overlay get data from??

import React, {createContext, useContext, useState} from 'react';
import {BrowserRouter as Router, Routes, Route}
  from 'react-router-dom';

import Home from './pages/home';
import Settings from './pages/settings';
import Metrics from './pages/metrics';

import {darkTheme, lightTheme} from './themes/base';
import useMediaQuery from '@mui/material/useMediaQuery';
import {ThemeProvider} from '@mui/material';

import {AdapterLuxon} from '@mui/x-date-pickers/AdapterLuxon';
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import {GoogleOAuthProvider} from '@react-oauth/google';
import {ToastContainer} from 'material-react-toastify';

import 'material-react-toastify/dist/ReactToastify.css';
import './App.css';
import {StudentStatusValues} from './services/StudentStatus';

type QueueDataContent = {
  // not mirrored on backend
  frontendInitialized: boolean,

  // most important global data
  title: string,
  isOwner: boolean,
  uninitializedSem: boolean,

  // global stats
  announcements: {
    id: number,
    content: string
  }[],
  topics: {
    assignment_id: number,
    name: string
  }[],
  queueFrozen: boolean,
  numStudents: number
  rejoinTime: number,
  waitTime: number,

  // user state
  isAuthenticated: boolean,
  isTA: boolean,
  isAdmin: boolean,
  andrewID: string,
  preferred_name: string,

  // need on backend // TODO Probably do this when you get waittimes not on a 30s timer
  numUnhelped?: number,
  minsPerStudent?: number,
  numTAs?: number,

  // should be part of settings not queueData
  // name?: string,
  adminSettings?: {
    currSem: string,
    slackURL: string | undefined,
    questionsURL: string | undefined,
    rejoinTime: number
  },
  locations?: {
    dayDictionary: any,
    roomDictionary: any
  },
  tas?: {
    ta_id: number,
    name: string,
    preferred_name: string,
    email: string,
    isAdmin: boolean,
  }[],
  settings?: any,
}

type QueueDataContextContent = {
  queueData: QueueDataContent
  setQueueData: React.Dispatch<React.SetStateAction<QueueDataContent>>
}

let QueueDataContext: React.Context<QueueDataContextContent>;
let useQueueDataContext: () => QueueDataContextContent;

type StudentDataContent = {
  frontendInitialized: boolean,

  name: string,
  andrewID: string,
  taID: number,
  taAndrewID: string,
  location: string,
  topic: string,
  question: string,
  isFrozen: boolean,
  message: string,
  messageBuffer: string[],
  status: number,
  position: number,

  // unclear if used??
  // helpingTA?: {
  //   taId: number,
  //   taName: string,
  //   taZoomUrl: string,
  // }
}

type StudentDataContextContent = {
  studentData: StudentDataContent
  setStudentData: React.Dispatch<React.SetStateAction<StudentDataContent>>
}

let StudentDataContext: React.Context<StudentDataContextContent>;
let useStudentDataContext: () => StudentDataContextContent;

function App() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const theme = React.useMemo(
      () =>
      prefersDarkMode ? darkTheme : lightTheme,
      [prefersDarkMode],
  );
  const ThemeContext = React.createContext(theme);

  const [queueData, setQueueData] = useState({
    frontendInitialized: false,

    title: '15-122 Office Hours Queue',
    isOwner: false,
    uninitializedSem: false,

    announcements: [],
    topics: [],
    queueFrozen: true,
    numStudents: 0,
    rejoinTime: 15,
    waitTime: 0,

    isAuthenticated: false,
    isTA: false,
    isAdmin: false,
    andrewID: '',
    preferred_name: '',
  });

  QueueDataContext = createContext<QueueDataContextContent>({
    queueData: queueData,
    setQueueData: setQueueData,
  });
  useQueueDataContext = () => useContext(QueueDataContext);


  const [studentData, setStudentData] = useState({
    frontendInitialized: false,

    name: '',
    andrewID: '',
    taID: -1,
    taAndrewID: '',
    location: '',
    topic: '',
    question: '',
    isFrozen: false,
    message: '',
    messageBuffer: [],
    status: StudentStatusValues.OFF_QUEUE,
    position: -1,
  });

  StudentDataContext = createContext<StudentDataContextContent>({
    studentData: studentData,
    setStudentData: setStudentData,
  });
  useStudentDataContext = () => useContext(StudentDataContext);

  return (
    <ThemeProvider theme={theme || darkTheme}>
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <ThemeContext.Provider value={theme}>
          <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
            <QueueDataContext.Provider value = {{queueData, setQueueData}}>
              <StudentDataContext.Provider value = {{studentData, setStudentData}}>
                <Router>
                  <Routes>
                    <Route path='/' element={<Home theme={theme || darkTheme}/>} />
                    <Route path='/settings' element={<Settings/>} />
                    <Route path='/metrics' element={<Metrics/>} />
                  </Routes>
                </Router>
                <ToastContainer
                  position="bottom-left"
                  autoClose={5000}
                  hideProgressBar={false}
                  newestOnTop={false}
                  closeOnClick
                  rtl={false}
                  pauseOnFocusLoss
                  draggable
                  pauseOnHover
                />
              </StudentDataContext.Provider>
            </QueueDataContext.Provider>
          </GoogleOAuthProvider>
        </ThemeContext.Provider>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export {
  QueueDataContext,
  useQueueDataContext,
  StudentDataContext,
  useStudentDataContext,
};

export default App;
