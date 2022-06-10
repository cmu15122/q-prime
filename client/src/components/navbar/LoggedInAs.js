import React, { useState } from 'react';
import {
    Box, Button
} from '@mui/material'

export default function LoggedInAs(props) {
    const {} = props;
    return (
        <Box sx={{ flexGrow: 0, display: { xs: "none", md: "flex" } }}>
            <Button disabled variant="h8" noWrap sx={{ color: "#FFFFFF"}}>
            Logged in as [ANDREWID]
            </Button>
        </Box>
    );
}