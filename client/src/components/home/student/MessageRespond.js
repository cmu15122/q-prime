import React, { useState } from 'react';
import {
    Box,
    Typography,
    Button,
    Dialog,
    Input,
} from '@mui/material'

export default function UpdateQuestionOverlay(props) {
    const printRemove = () => {
        console.log('this answered my question');
    }

    const printStay = () => {
        console.log('this didn\'t answer my question');
    }

    return (
        <div style={{display:'flex'}}>
            <Box
                m="auto"
                sx={{textAlign: 'left', border: '3px solid black', width: '30%'}}
            >
                <Typography variant='h3'>TA TA_NAME sent you a message:</Typography>
                <Typography variant='body1'>Hey here's an answer to your question</Typography>
                <Button variant='outlined' onClick={printRemove}>This answered my question (remove from queue)</Button>
                <Button variant='outlined' onClick={printStay}>This didn't answer my question (stay on the queue)</Button>
            </Box>
        </div>
    );
}
