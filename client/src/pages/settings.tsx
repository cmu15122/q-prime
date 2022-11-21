import React, {useState, useEffect, useContext} from 'react';

import Navbar from '../components/navbar/Navbar';
import SettingsMain from '../components/settings/SettingsMain';

import SettingsDataService from '../services/SettingsService';
import {useTheme} from '@mui/material/styles';
import {QueueDataContext, useQueueDataContext} from '../App';

function Settings() {
  const theme = useTheme();

  const {queueData, setQueueData} = useQueueDataContext();

  useEffect(() => {
    if (queueData.title == 'UNINITIALIZED') {
      SettingsDataService.getAll()
          .then((res) => {
            setQueueData(res.data);
            document.title = res.data.title;
          });
    }
  }, []);

  return (
    <div className="Settings" style={{backgroundColor: theme.palette.background.default}}>
      <Navbar/>
      {
        queueData != null &&
          <SettingsMain/>
      }
    </div>
  );
}

export default Settings;
