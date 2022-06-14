import React from 'react';
import { BrowserRouter as Router, Routes, Route}
    from 'react-router-dom';
import { CookiesProvider } from 'react-cookie';

import Home from './pages/home';
import Admin from './pages/admin';
import Settings from './pages/settings';
import Metrics from './pages/metrics';
import { basicTheme } from './themes/base.js';

import { ThemeProvider } from '@mui/material'
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
  
function App() {
    return (
        <ThemeProvider theme={basicTheme}>
            <LocalizationProvider dateAdapter={AdapterLuxon}>
                <Router>
                <Routes>
                    <Route path='/' element={<Home theme={basicTheme}/>} />
                    <Route path='/admin' element={<Admin theme={basicTheme}/>} />
                    <Route path='/settings' element={<Settings theme={basicTheme}/>} />
                    <Route path='/metrics' element={<Metrics theme={basicTheme}/>} />
                </Routes>
                </Router>
            </LocalizationProvider>
        </ThemeProvider>
    );
}

export default App;
