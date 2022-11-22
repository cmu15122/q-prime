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

type QueueDataContent = {
  frontendInitialized: boolean,
  title?: string,
  announcements?: {
    id: number,
    content: string
  }[],
  queueFrozen?: boolean,
  numStudents?: number,
  waitTime?: number,
  rejoinTime?: number,
  isAuthenticated?: boolean,
  isTA?: boolean,
  isAdmin?: boolean,
  andrewID?: string,
  preferred_name?: string,
  isOwner?: boolean,
  topics?: {
    assignment_id: number,
    name: string
  }[],
  name?: string,
  uninitializedSem?: boolean,
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
  settings?: any
}

type QueueDataContextContent = {
  queueData: QueueDataContent
  setQueueData: React.Dispatch<React.SetStateAction<QueueDataContent>>
}

let QueueDataContext: React.Context<QueueDataContextContent>;
let useQueueDataContext: () => QueueDataContextContent;

function App() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const theme = React.useMemo(
      () =>
      prefersDarkMode ? darkTheme : lightTheme,
      [prefersDarkMode],
  );

  const [queueData, setQueueData] = useState({
    frontendInitialized: false,
  });

  const ThemeContext = React.createContext(theme);

  QueueDataContext = createContext<QueueDataContextContent>({
    queueData: queueData,
    setQueueData: setQueueData,
  });
  useQueueDataContext = () => useContext(QueueDataContext);

  return (
    <ThemeProvider theme={theme || darkTheme}>
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <ThemeContext.Provider value={theme}>
          <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
            <QueueDataContext.Provider value = {{queueData, setQueueData}}>
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
};

export default App;
