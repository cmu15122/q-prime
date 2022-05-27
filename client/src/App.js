import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route}
    from 'react-router-dom';
import Home from './pages/home';
import Admin from './pages/admin';
import Settings from './pages/settings';
  
function App() {
  return (
      <Router>
      <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/admin' element={<Admin/>} />
          <Route path='/settings' element={<Settings/>} />
      </Routes>
      </Router>
  );
}
  
export default App;
