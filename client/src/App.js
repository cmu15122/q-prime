import React from 'react';
import { BrowserRouter as Router, Routes, Route}
    from 'react-router-dom';

import Home from './pages/home';
import Settings from './pages/settings';
import Metrics from './pages/metrics';
import { basicTheme } from './themes/base.js';

import { ThemeProvider } from '@mui/material'
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { ToastContainer } from 'material-react-toastify';
import 'material-react-toastify/dist/ReactToastify.css';

function App() {
    return (
        <ThemeProvider theme={basicTheme}>
            <LocalizationProvider dateAdapter={AdapterLuxon}>
                <Router>
                <Routes>
                    <Route path='/' element={<Home theme={basicTheme}/>} />
                    <Route path='/settings' element={<Settings theme={basicTheme}/>} />
                    <Route path='/metrics' element={<Metrics theme={basicTheme}/>} />
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
