import React, { useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';
import {
    useMediaQuery, AppBar, Toolbar, Box, Button, MenuItem, Menu, IconButton, Typography
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

import OHQueueHeader from './OHQueueHeader';
import LoggedInAs from './LoggedInAs';
import GoogleLogin from './GoogleLogin';

function createPage(page, link) {
    return { page, link };
}

export default function Navbar(props) {
    const { theme, queueData } = props;
    const isMobileView = useMediaQuery("(max-width: 900px)");
    
    const [cookies, setCookie, removeCookie] = useCookies(['user']);

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isTA, setIsTA] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [pages, setPages] = useState([]);

    const [anchorElNav, setAnchorElNav] = React.useState(null);
  
    const handleOpenNavMenu = (event) => {
        setAnchorElNav(event.currentTarget);
    };

    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
    };

    const goToPage = (pageLink) => (event) => { 
        window.location.href = pageLink;
    };

    useEffect(() => {
        if (queueData != null) {
            setIsAuthenticated(queueData.isAuthenticated);
            setIsTA(queueData.isTA);
            setIsAdmin(queueData.isAdmin);
        }
    }, [queueData]);

    useEffect(() => {
        let newPages = [];

        if (isAuthenticated) {
            if (isTA) {
                newPages.push(createPage('Settings', '/settings'));
                newPages.push(createPage('Metrics', '/metrics'));
            }
        }

        setPages(newPages);
    }, [isAuthenticated, isTA, isAdmin]);

    function handleLogout() {
        removeCookie('user');
        window.location.href = "/";
    }

    if (!isMobileView) {
        return (
            <AppBar position="static">
            <Toolbar sx={{ display: "flex space-between" }}>  
                <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" }}}>
                    <OHQueueHeader theme={theme}/>
                </Box>

                <Box sx={{ flexGrow: 0, display: { xs: "none", md: "flex" }, justifyContent: 'flex-end'}}>
                    {
                        isAuthenticated && <LoggedInAs theme={theme} queueData={queueData}/>
                    }
                </Box>

                <Box sx={{ flexGrow: 0, display: { xs: "none", md: "flex" }}}>
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

                    {
                        isAuthenticated ?
                        <Button
                            disableElevation
                            variant='h8'
                            sx={{ color: "#FFFFFF", backgroundColor: 'transparent' }} 
                            onClick={handleLogout}
                        >
                            Logout
                        </Button>
                        :
                        <GoogleLogin theme={theme} queueData={queueData}/>
                    }
                </Box>
            </Toolbar>
          </AppBar>
        );
    }
    return (
        <AppBar position="static">
        <Toolbar sx={{ display: "flex space-between" }}>
            {
                ((pages && pages.length > 0) || isAuthenticated)  && 
                <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }} >
                    <IconButton
                        size="large"
                        aria-label="account of current user"
                        aria-controls="menu-appbar"
                        aria-haspopup="true"
                        onClick={handleOpenNavMenu}
                        color="inherit"
                    >
                        <MenuIcon/>
                    </IconButton>
                    <Menu
                        id="menu-appbar"
                        anchorEl={anchorElNav}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'left',
                        }}
                        keepMounted
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'left',
                        }}
                        open={Boolean(anchorElNav)}
                        onClose={handleCloseNavMenu}
                        sx={{
                            display: { xs: 'block', md: 'none' },
                        }}
                    >
                        {pages?.map((page) => (
                            <MenuItem key={page.page} onClick={goToPage(page.link)}>
                                <Typography variant='h8' sx={{ mx: 2 }}>
                                    {page.page}
                                </Typography>
                            </MenuItem>
                        ))}
                        {
                            isAuthenticated &&
                            <MenuItem onClick={handleLogout}>
                                <Typography variant='h8' sx={{ mx: 2 }}>
                                    Logout
                                </Typography>
                            </MenuItem>
                        }
                    </Menu>
                </Box>
            }

            <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }} >
                <OHQueueHeader />
            </Box>
            <Box sx={{ flexGrow: 0, display: { xs: 'flex', md: 'none' } }} >
                {
                    !isAuthenticated && <GoogleLogin theme={theme} queueData={queueData}/>
                }
            </Box>
        </Toolbar>
      </AppBar>
    );
}
