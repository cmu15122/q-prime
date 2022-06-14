import React, { useState } from 'react';
import { useCookies } from 'react-cookie';
import {
    AppBar, Toolbar, Typography, Box, Button
} from '@mui/material';

import OHQueueHeader from './OHQueueHeader';
import LoggedInAs from './LoggedInAs';

function createPage(page, link) {
    return { page, link };
}

const pages = [createPage('Admin', '/admin'), createPage('Settings', '/settings'), createPage('Metrics', '/metrics')];

export default function LoginAdminNavbar(props) {
    const {} = props;
    const [cookies, setCookie, removeCookie] = useCookies(['user']);

    function handleLogout() {
        fetch('/logout', {
            method: 'POST',
            body: JSON.stringify({
                // TODO: pass in whatever we use to store current user info
            }),
            headers: {
                'Content-Type': 'application/json',
            }
        });
        removeCookie('user');
        window.location.reload();
    }

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

                <Button
                    disableElevation
                    variant='h8'
                    sx={{ color: "#FFFFFF", backgroundColor: 'transparent' }} 
                    onClick={handleLogout}
                >
                    Logout
                </Button>
            </Box>
        </Toolbar>
      </AppBar>
    );
}