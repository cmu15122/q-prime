import React from 'react';
import { BrowserRouter as Router, Routes, Route}
    from 'react-router-dom';
import { CookiesProvider } from 'react-cookie';

import Home from './pages/home';
import Admin from './pages/admin';
import Settings from './pages/settings';
import './App.css';

function App() {
    return (
        <CookiesProvider>
            <Router>
                <Routes>
                    <Route path='/' element={<Home />} />
                    <Route path='/admin' element={<Admin/>} />
                    <Route path='/settings' element={<Settings/>} />
                </Routes>
            </Router>
        </CookiesProvider>
    );
}

export default App;
