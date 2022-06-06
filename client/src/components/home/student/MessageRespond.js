import React, { useState } from 'react';
import {
    Typography,
    Button,
    Card, 
    CardContent, 
    Divider
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
        </div>
    );
}
