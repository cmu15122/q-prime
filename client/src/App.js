import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route}
    from 'react-router-dom';
import Home from './pages/home';
import Admin from './pages/admin';
import Settings from './pages/settings';
import { basicTheme } from './themes/base.js';
import { ThemeProvider } from '@mui/material'
  
function App() {
    return (
        <ThemeProvider theme={basicTheme}>
            <Router>
            <Routes>
                <Route path='/' element={<Home />} />
                <Route path='/admin' element={<Admin theme={basicTheme}/>} />
                <Route path='/settings' element={<Settings/>} />
            </Routes>
            </Router>
        </ThemeProvider>
    );
}
  
export default App;
