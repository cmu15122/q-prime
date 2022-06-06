import React, { useState } from 'react';
import {
    Box,
    Typography,
    Button,
    Dialog,
    Input,
    Card, CardContent, Divider, Grid
} from '@mui/material'

export default function UpdateQuestionOverlay(props) {

    const { } = props

    const printRemove = () => {
        console.log('this answered my question');
    }

    const printStay = () => {
        console.log('this didn\'t answer my question');
    }

    return (
        <div className='card' style={{display:'flex'}}>
            <Card sx={{ minWidth : '100%'}}>
                <CardContent sx={{textAlign: 'left', border: '3px solid black'}}>
                    <Typography variant='h5' sx={{fontWeight: 'bold'}}>TA TA_NAME sent you a message:</Typography>
                    <Typography variant='body1'>Hey here's an answer to your question</Typography>
                    
                    <Divider sx={{marginTop:".5em", marginBottom:".5em"}}/>
                    
                    <div>
                        <Button variant="contained" onClick={printRemove} sx={{m:0.5}}>This answered my question (remove from queue)</Button>
                        <Button variant="contained" onClick={printStay} sx={{m:0.5}}>This didn't answer my question (stay on the queue)</Button>
                    </div>

                </CardContent>
            </Card>

            {/* <Box
                m="auto"
                sx={{textAlign: 'left', border: '3px solid black', width: '30%'}}
            >
                <Typography variant='h3'>TA TA_NAME sent you a message:</Typography>
                <Typography variant='body1'>Hey here's an answer to your question</Typography>
                <Button variant='outlined' onClick={printRemove}>This answered my question (remove from queue)</Button>
                <Button variant='outlined' onClick={printStay}>This didn't answer my question (stay on the queue)</Button>
            </Box> */}
        </div>
    );
}
