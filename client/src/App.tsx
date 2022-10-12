import React from 'react';
import { BrowserRouter as Router, Routes, Route}
    from 'react-router-dom';

import Home from './pages/home';
import Settings from './pages/settings';
import Metrics from './pages/metrics';
import { darkTheme, lightTheme } from './themes/base';
import useMediaQuery from '@mui/material/useMediaQuery';
import { ThemeProvider } from '@mui/material'

import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { ToastContainer } from 'material-react-toastify';

import 'material-react-toastify/dist/ReactToastify.css';
import './App.css';

function App() {
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    const theme = React.useMemo(
        () =>
            prefersDarkMode ? darkTheme : lightTheme,
        [prefersDarkMode],
    );

    const ThemeContext = React.createContext(theme);

    return (
        <ThemeProvider theme={theme || darkTheme}>
            <LocalizationProvider dateAdapter={AdapterLuxon}>
            <ThemeContext.Provider value={theme}>
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
            </ThemeContext.Provider>
            </LocalizationProvider>
        </ThemeProvider>
    );
}

export default App;
