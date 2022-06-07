import * as React from 'react';
import {
    Typography,
    Divider,
    Card,
    CardContent
} from '@mui/material'

export default function YourEntry(props) {
    const position = 11
    const waitTime = 20
    const location = 'Remote - TA Zoom will be provided when helped.'
    const topic = 'Programming X'
    const question = 'Student\'s Question'
    
    const { } = props
    return (
        <div className='card' style={{display:'flex'}}>
            <Card sx={{ minWidth : '100%'}}>
                <CardContent>
                    
                    <Typography variant='h5' sx={{fontWeight: 'bold', textAlign: 'left'}}>Your Entry:</Typography>
                    
                    <Divider sx={{marginTop:".5em", marginBottom:".5em"}}/>
                    
                    <Typography variant='h6' sx={{textAlign:'left'}}>You are <strong>{position}th in line</strong>.</Typography>
                    <Typography variant='h6' sx={{textAlign:'left'}}>The estimated wait time is <strong>{waitTime} minutes</strong> from your position.</Typography>
                    
                    <Divider sx={{marginTop:".5em", marginBottom:".5em"}}/>
                    
                    <Typography variant='h5' sx={{fontWeight: 'bold', textAlign: 'left'}}>Location:</Typography>
                    <Typography variant='h6' sx={{textAlign:'left'}}>{location}</Typography>
                    
                    <Divider sx={{marginTop:".5em", marginBottom:".5em"}}/>

                    <Typography variant='h5' sx={{fontWeight: 'bold', textAlign: 'left'}}>Topic:</Typography>
                    <Typography variant='h6' sx={{textAlign:'left'}}>{topic}</Typography>
                    
                    <Divider sx={{marginTop:".5em", marginBottom:".5em"}}/>
                    
                    <Typography variant='h5' sx={{fontWeight: 'bold', textAlign: 'left'}}>Question:</Typography>
                    <Typography variant='h6' sx={{textAlign:'left'}}>{question}</Typography>
                </CardContent>
            </Card>
        </div>
    );
}
