import React, { useState } from 'react';
import {
    AppBar, Toolbar, Typography, Box, Button, Link
} from '@mui/material'
import OHQueueHeader from './OHQueueHeader';

function createPage(page, link) {
    return { page, link };
}

const pages = [createPage('Log In', '/')];


export default function LogoutNavbar(props) {
    const {} = props;
    return (
        <AppBar position="static">
        <Toolbar sx={{ display: "flex"  }}>
            <OHQueueHeader theme={props.theme}/>
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