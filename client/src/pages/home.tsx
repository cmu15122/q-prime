import React, {useContext, useEffect} from 'react';
import {useTheme} from '@mui/material';

import Navbar from '../components/navbar/Navbar';
import HomeMain from '../components/home/HomeMain';

import HomeService from '../services/HomeService';
import {initiateSocket} from '../services/SocketsService';


function Home(props) {
  const theme = useTheme();

  return (
    <div className="App" style={{backgroundColor: theme.palette.background.default}}>
      <Navbar isHome={true}/>
      <HomeMain/>
    </div>
  );
}

export default Home;
