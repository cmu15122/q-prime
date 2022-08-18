import React from 'react';
import { BrowserRouter as Router, Routes, Route}
    from 'react-router-dom';

import Home from './pages/home';
import Settings from './pages/settings';
import Metrics from './pages/metrics';
import { theme, darkTheme, lightTheme } from './themes/base.js';
import useMediaQuery from '@mui/material/useMediaQuery';
import { createTheme, ThemeProvider } from '@mui/material'

import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { ToastContainer } from 'material-react-toastify';

import 'material-react-toastify/dist/ReactToastify.css';
import './App.css';

function App() {
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    const theme = React.useMemo(
        () =>
            prefersDarkMode ? darkTheme : lightTheme
        [prefersDarkMode],
    );

    return (
        <ThemeProvider theme={theme}>
            <LocalizationProvider dateAdapter={AdapterLuxon}>
                <Router>
                <Routes>
                    <Route path='/' element={<Home theme={theme}/>} />
                    <Route path='/settings' element={<Settings theme={theme}/>} />
                    <Route path='/metrics' element={<Metrics theme={theme}/>} />
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
            </LocalizationProvider>
        </ThemeProvider>
    );
}

export default App;
