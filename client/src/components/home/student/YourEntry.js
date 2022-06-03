import * as React from 'react';
import {
    Box,
    Typography,
    Divider
} from '@mui/material'

export default function YourEntry() {
    const position = 11
    const waitTime = 20
    const location = 'Remote - TA Zoom will be provided when helped.'
    const topic = 'Programming X'
    const question = 'Student\'s Question'
    return (
        <div style={{display:'flex'}}>
            <Box
                m="auto"
                sx={{textAlign: 'left', border: '3px solid black', width: '50%'}}
            >
                <Typography variant='h2'>Your Entry</Typography>
                <Divider />
                <Typography variant='h3'>You are {position}th in line.</Typography>
                <Typography variant='h5'>The estimated wait time is {waitTime} minutes.</Typography>
                <Typography></Typography>
                <Typography variant='h6'>Location</Typography>
                <Typography variant='h4'>{location}</Typography>
                <Typography variant='h6'>Topic</Typography>
                <Typography variant='h4'>{topic}</Typography>
                <Typography variant='h6'>Question</Typography>
                <Typography variant='h4'>{question}</Typography>
            </Box>
        </div>
    );
}
