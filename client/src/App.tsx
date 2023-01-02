// TODO: Bug where setting preferred name as student causes crash and reload
// TODO: Standardize queueData.locations
// TODO: Where does TAHelping overlay get data from??

import React, {createContext, useContext, useEffect, useState} from 'react';
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
import {QueueData} from '../../../q-prime/types/QueueData'
import {StudentData} from '../../../q-prime/types/StudentData'
import {QueueSettings} from '../../../q-prime/types/QueueSettings'
import { socketSubscribeTo } from './services/SocketsService';
import HomeService from './services/HomeService';

type QueueDataContextContent = {
  queueData: QueueData
  setQueueData: React.Dispatch<React.SetStateAction<QueueData>>
}
let QueueDataContext: React.Context<QueueDataContextContent>;

type StudentDataContextContent = {
  studentData: StudentData
  setStudentData: React.Dispatch<React.SetStateAction<StudentData>>
}
let StudentDataContext: React.Context<StudentDataContextContent>;

type QueueSettingsContextContent = {
  queueSettings: QueueSettings,
  setQueueSettings: React.Dispatch<React.SetStateAction<QueueSettings>>
}
let QueueSettingsContext: React.Context<QueueSettingsContextContent>


function App() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const theme = React.useMemo(
      () =>
      prefersDarkMode ? darkTheme : lightTheme,
      [prefersDarkMode],
  );
  const ThemeContext = React.createContext(theme);

  const [queueData, setQueueData] = useState<QueueData>({
    title: '15-122 Office Hours Queue',
    uninitializedSem: false,
    queueFrozen: true,

    isOwner: false,
    isAuthenticated: false,
    isTA: false,
    isAdmin: false,
    andrewID: '',
    preferred_name: '',

    numStudents: 0,
    rejoinTime: 15,
    waitTime: 0,
    numUnhelped: 0,
    minsPerStudent: 0,
    numTAs: 0,

    announcements: [],
    topics: [],
    locations: {
      dayDictionary: {},
      roomDictionary: {},
    },

    tas: [],
  });
  // this needs to be created at a higher level to prevent unintentional rerenders
  const queueDataContextObject = {
    queueData: queueData,
    setQueueData: setQueueData,
  }
  QueueDataContext = createContext<QueueDataContextContent>(queueDataContextObject);

  const [studentData, setStudentData] = useState<StudentData>({
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
  // this needs to be created at a higher level to prevent unintentional rerenders
  const studentDataContextObject = {
    studentData: studentData,
    setStudentData: setStudentData,
  }
  StudentDataContext = createContext<StudentDataContextContent>(studentDataContextObject);

  const [queueSettings, setQueueSettings] = useState<QueueSettings>({
    currSem: '',
    slackURL: undefined,
    questionsURL: undefined,
    rejoinTime: 15,

    videoChatEnabled: false,
    videoChatURL: ''
  });
  // this needs to be created at a higher level to prevent unintentional rerenders
  const queueSettingsContextObject = {
    queueSettings: queueSettings,
    setQueueSettings: setQueueSettings,
  }
  QueueSettingsContext = createContext<QueueSettingsContextContent>(queueSettingsContextObject);


  // subscribe to global sockets
  useEffect(() => {
    HomeService.getAll().then((res) => {
      setQueueData(res.data);
      document.title = res.data.title;
    })

    HomeService.getStudentData().then((res) => {
      setStudentData(res.data);
    })

    socketSubscribeTo('queueData', (data: QueueData) => {
      setQueueData(data)
    })

    socketSubscribeTo('studentData', (data: StudentData) => {
      setStudentData(data)
    })
  }, [])

  return (
    <ThemeProvider theme={theme || darkTheme}>
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <ThemeContext.Provider value={theme}>
          <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
            <QueueDataContext.Provider value = {queueDataContextObject}>
              <StudentDataContext.Provider value = {studentDataContextObject}>
                <QueueSettingsContext.Provider value = {queueSettingsContextObject}>
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
                </QueueSettingsContext.Provider>
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
  StudentDataContext,
  QueueSettingsContext
};

export default App;
