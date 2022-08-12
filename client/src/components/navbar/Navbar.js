import React, { useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';
import {
    useMediaQuery, AppBar, Toolbar, Box, Button, MenuItem, Menu, 
    IconButton, Typography
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { styled } from '@mui/material/styles';

import OHQueueHeader from './OHQueueHeader';
import LoggedInAs from './LoggedInAs';
import GoogleLogin from './GoogleLogin';
import AlertOnLogout from './dialogs/AlertOnLogout';

import HomeService from '../../services/HomeService';
import { socketSubscribeTo } from '../../services/SocketsService';

function createPage(page, link) {
    return { page, link };
}

const NavbarButton = styled(Button)({
    disableElevation: true,
    variant: 'h8',
    color: "#FFFFFF", 
    backgroundColor: 'transparent'
});

export default function Navbar(props) {
    const { theme, queueData, isHome, studentData } = props;
    const isMobileView = useMediaQuery("(max-width: 1000px)");
    
    const [ , , removeCookie] = useCookies(['user']);

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isTA, setIsTA] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [pages, setPages] = useState([]);
    const [queueFrozen, setQueueFrozen] = useState(false);

    const [anchorElNav, setAnchorElNav] = useState(null);

    const [alertOpen, setAlertOpen] = useState(false);

    const handleOpenNavMenu = (event) => {
        setAnchorElNav(event.currentTarget);
    };

    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
    };

    const goToPage = (pageLink) => () => { 
        window.location.href = pageLink;
    };

    useEffect(() => {
        socketSubscribeTo("queueFrozen", (data) => {
            setQueueFrozen(data.isFrozen);
        });
    }, []);

    useEffect(() => {
        if (queueData != null) {
            setQueueFrozen(queueData.queueFrozen);
            setIsAuthenticated(queueData.isAuthenticated);
            setIsTA(queueData.isTA);
            setIsAdmin(queueData.isAdmin);
        }
    }, [queueData]);

    useEffect(() => {
        let newPages = [];

        if (isAuthenticated && isTA) {
            newPages.push(createPage('Settings', '/settings'));
            newPages.push(createPage('Metrics', '/metrics'));
        }

        setPages(newPages);
    }, [isAuthenticated, isTA, isAdmin]);

    function handleLogout() {
        removeCookie('user');
        window.location.href = "/";
    }

    function openAlert() {
        setAlertOpen(true);
    }

    function handleLogoutClicked() {
        if (studentData?.position != null && studentData.position !== -1) {
            openAlert();
        } else {
            handleLogout();
        }
    }

    const freezeQueue = () => {
        HomeService.freezeQueue();
    };

    const unfreezeQueue = () => {
        HomeService.unfreezeQueue();
    };

    const unfreezeButton = <Button color="secondary" variant="contained" sx={{ mx: 2 }} onClick={unfreezeQueue}>Unfreeze</Button>;
    const freezeButton = <Button color="secondary" variant="contained" sx={{ mx: 2 }} onClick={freezeQueue}>Freeze</Button>;

    if (!queueData) {
        // No queue data received, nothing to render
        return (
            <AppBar position="static">
            <Toolbar sx={{ display: "flex space-between" }}>  
                <Box sx={{ flexGrow: 1, display: "flex" }}>
                    <OHQueueHeader theme={theme}/>
                </Box>
            </Toolbar>
          </AppBar>
        );
    }
    else if (isMobileView) {
        return (
            <AppBar position="static">
            <Toolbar sx={{ display: "flex space-between" }}>
                {
                    ((pages && pages.length > 0) || isAuthenticated)  && 
                    <Box sx={{ flexGrow: 1, display: 'flex' }}>
                        <IconButton
                            size="large"
                            onClick={handleOpenNavMenu}
                            color="inherit"
                        >
                            <MenuIcon/>
                        </IconButton>
                        <Menu
                            id="navbar-menu"
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
                            sx={{ display: 'block' }}
                        >
                            {
                                isTA && isHome && (queueFrozen ? 
                                    <MenuItem onClick={unfreezeQueue}>
                                        <Typography variant='h8' sx={{ mx: 2 }}>
                                            Unfreeze
                                        </Typography>
                                    </MenuItem>
                                    : 
                                    <MenuItem onClick={freezeQueue}>
                                        <Typography variant='h8' sx={{ mx: 2 }}>
                                            Freeze
                                        </Typography>
                                    </MenuItem>
                                )
                            }
                            {
                                pages?.map((page) => (
                                    <MenuItem key={page.page} onClick={goToPage(page.link)}>
                                        <Typography variant='h8' sx={{ mx: 2 }}>
                                            {page.page}
                                        </Typography>
                                    </MenuItem>
                                ))
                            }
                            {
                                isAuthenticated &&
                                <MenuItem onClick={handleLogoutClicked}>
                                    <Typography variant='h8' sx={{ mx: 2 }}>
                                        Logout
                                    </Typography>
                                </MenuItem>
                            }
                        </Menu>
                    </Box>
                }
    
                <Box sx={{ flexGrow: 1, display: 'flex' }} >
                    <OHQueueHeader/>
                </Box>
                <Box sx={{ flexGrow: 0, display: 'flex', justifyContent: 'flex-end' }} >
                    {
                        !isAuthenticated && <GoogleLogin theme={theme} queueData={queueData}/>
                    }
                </Box>
                <AlertOnLogout isOpen={alertOpen} setOpen={setAlertOpen} handleConfirm={handleLogout}/>
            </Toolbar>
            </AppBar>
        );
    }

    // Desktop view
    return (
        <AppBar position="static">
        <Toolbar sx={{ display: "flex space-between" }}>  
            <Box sx={{ flexGrow: 1, display: "flex" }}>
                <OHQueueHeader/>
                {
                    isTA && isHome && (queueFrozen ? unfreezeButton : freezeButton)
                }
            </Box>
            <Box sx={{ flexGrow: 0, display: "flex", justifyContent: 'flex-end'}}>
                {
                    isAuthenticated && <LoggedInAs theme={theme} queueData={queueData}/>
                }
            </Box>

            <Box sx={{ flexGrow: 0, display: "flex" }}>
                {
                    pages?.map((page) => (
                        <NavbarButton key={page.page} href={page.link}>{page.page}</NavbarButton>
                    ))
                }
                {
                    isAuthenticated ?
                    <NavbarButton onClick={handleLogoutClicked}>Logout</NavbarButton>
                    :
                    <GoogleLogin theme={theme} queueData={queueData}/>
                }
            </Box>
            <AlertOnLogout isOpen={alertOpen} setOpen={setAlertOpen} handleConfirm={handleLogout}/>
        </Toolbar>
        </AppBar>
    );
}
