import React, { useState } from 'react';
import {
    AppBar, Toolbar, Typography, Box, Button
} from '@mui/material'
import OHQueueHeader from './OHQueueHeader';
import LoggedInAs from './LoggedInAs';

function createPage(page, link) {
    return { page, link };
}

const pages = [createPage('Settings', '/settings'), createPage('Log Out', '/')];


export default function LoginTANavbar(props) {
    const {} = props;
    return (
        <AppBar position="static">
        <Toolbar sx={{ display: "flex space-between"  }}>
            <OHQueueHeader theme={props.theme}/>
            <LoggedInAs theme={props.theme}/>
            <Box
                sx={{
                    flexGrow: 0, display: { xs: "none", md: "flex" }
                }}
            >
                {pages.map((pages) => (
                    <Button
                        disableElevation

                        key={pages.page}
                        variant='h8'
                        href={pages.link}
                        sx={{ color: "#FFFFFF", backgroundColor: 'transparent' }}
                    >
                        {pages.page}
                    </Button>
                ))}
            </Box>
        </Toolbar>
      </AppBar>
    );
}