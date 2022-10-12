import React, { useState, useEffect } from 'react';

import Navbar from '../components/navbar/Navbar';
import SettingsMain from '../components/settings/SettingsMain';

import SettingsDataService from "../services/SettingsService";
import { useTheme } from '@mui/material/styles';

function Settings() {
    const theme = useTheme();

    const [queueData, setQueueData] = useState(null);

    useEffect(() => {
        SettingsDataService.getAll()
            .then(res => {
                setQueueData(res.data);
                document.title = res.data.title;
            });
    }, []);

    return (
        <div className="Settings" style={{backgroundColor: theme.palette.background.default}}>
            <Navbar queueData={queueData}/>
            {
                queueData != null && 
                <SettingsMain queueData={queueData}/>
            }
        </div>
    );
}

export default Settings;
