import React, { useState, useEffect } from 'react';
import {
    AppBar, Toolbar, Box, Button
} from '@mui/material';

import OHQueueHeader from './OHQueueHeader';
import LoggedInAs from './LoggedInAs';

function createPage(page, link) {
    return { page, link };
}

export default function Navbar(props) {
    const { theme, queueData } = props;

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isTA, setIsTA] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [pages, setPages] = useState([]);

    useEffect(() => {
        if (queueData != null) {
            setIsAuthenticated(queueData.isAuthenticated);
            setIsTA(queueData.isTA);
            setIsAdmin(queueData.isAdmin);
        }
    }, [queueData]);

    useEffect(() => {
        updatePages();
    }, [isAuthenticated, isTA, isAdmin]);
    
    const updatePages = () => {
        let newPages = [];

        if (isAuthenticated) {
            if (isTA) {
                newPages.push(createPage('Settings', '/settings'));
                newPages.push(createPage('Metrics', '/metrics'));
            }
            newPages.push(createPage('Log Out', '/'));
        }
        else {
            newPages.push(createPage('Log In', '/'));
        }

        setPages(newPages);
    }

    return (
        <AppBar position="static">
        <Toolbar sx={{ display: "flex space-between"  }}>
            <OHQueueHeader theme={theme}/>
            {
                isAuthenticated && <LoggedInAs theme={theme}/>
            }
            <Box
                sx={{
                    flexGrow: 0, display: { xs: "none", md: "flex" }
                }}
            >
                {pages?.map((page) => (
                    <Button
                        disableElevation

                        key={page.page}
                        variant='h8'
                        href={page.link}
                        sx={{ color: "#FFFFFF", backgroundColor: 'transparent' }}
                    >
                        {page.page}
                    </Button>
                ))}
            </Box>
        </Toolbar>
      </AppBar>
    );
}
