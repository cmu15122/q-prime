import React, { useState } from 'react';
import {
    Box, Button
} from '@mui/material'

export default function LoggedInAs(props) {
    const { queueData } = props;
    return (
        <Button disabled variant="h8" sx={{ color: "#FFFFFF"}}>
            Logged in as {queueData.andrewID}
        </Button>
    );
}
