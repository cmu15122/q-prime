import React from 'react';

import Navbar from '../components/navbar/Navbar';
import SettingsMain from '../components/settings/SettingsMain';

import {useTheme} from '@mui/material/styles';

function Settings() {
  const theme = useTheme();

  return (
    <div className="Settings" style={{backgroundColor: theme.palette.background.default}}>
      <Navbar/>
      <SettingsMain/>
    </div>
  );
}

export default Settings;
