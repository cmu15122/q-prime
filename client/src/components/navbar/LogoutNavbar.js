import React, { useState } from 'react';
import {
    AppBar, Toolbar, Box
} from '@mui/material';

import OHQueueHeader from './OHQueueHeader';
import LoginMain from '../login/LoginMain';

export default function LogoutNavbar(props) {
    const { theme } = props;

    return (
        <AppBar position="static">
        <Toolbar sx={{ display: "flex"  }}>
            <OHQueueHeader theme={theme}/>
            <Box
                sx={{
                    flexGrow: 0, display: { xs: "none", md: "flex" }
                }}
            >
                <LoginMain/>
            </Box>
        </Toolbar>
      </AppBar>
    );
}