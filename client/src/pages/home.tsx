import React from 'react';
import {useTheme} from '@mui/material';

import Navbar from '../components/navbar/Navbar';
import HomeMain from '../components/home/HomeMain';

function Home() {
  const theme = useTheme();

  return (
    <div className="App" style={{backgroundColor: theme.palette.background.default}}>
      <Navbar isHome={true}/>
      <HomeMain/>
    </div>
  );
}

export default Home;
