import React, { useState } from 'react';
import {
    Box,
    FormControl,
    FormLabel,
    Input
} from '@mui/material'

const theme = {
    spacing: 2
}

export default function VideoChatSettings() {
    return (
        <Box sx={{
                display: 'grid',
                width: '88%',
                height: 195,
                backgroundColor: '#f4f4f4',
                mx: "auto",
                mt: 21,
                textAlign: 'left'
            }}
        >
            <FormControl
                    sx={{ 
                        width: '100ch',
                        ml: 2
                    }}
            >
                <FormLabel
                    sx={{
                        mt: 2,
                        fontSize: 20,
                        color: "#000000"
                    }}>Video Chat Settings</FormLabel>
                <Input
                    placeholder="Video Chat URL"
                />
            </FormControl>
            {/* <FormControl sx={{ width: '25ch' }}>
                <FilledInput placeholder="Please enter text" />
            </FormControl> */}
        </Box>
    );
}
