import * as React from 'react';
import {
    Box,
    Typography,
    Divider,
    Card, Button, CardContent, TextField, Grid,
    Table, TableBody, TableCell, TableRow, Toolbar
} from '@mui/material'



export default function YourEntry(props) {
    const position = 11
    const waitTime = 20
    const location = 'Remote - TA Zoom will be provided when helped.'
    const topic = 'Programming X'
    const question = 'Student\'s Question'
    
    const { theme } = props
    return (
        <div className='card' style={{display:'flex'}}>
            <Card sx={{ minWidth : '100%'}}>
                <CardContent>
                    <Toolbar>
                        <div>
                            <Typography variant='h5' style={{borderRight: "0.1em solid black", padding: "0.5em", paddingBottom: "0em", paddingRight: "2em"}} sx={{fontWeight: 'bold', textAlign: 'center'}}>The queue is</Typography>
                            <Typography color="green" variant='h5' style={{borderRight: "0.1em solid black", padding: "0.5em", paddingTop: "0em", paddingRight: "2em"}} sx={{fontWeight: 'bold', textAlign: 'center'}}>OPEN</Typography>
                        </div>
                        <div>
                            <Typography style={{padding: "0.5em", paddingLeft: "2em"}}>There are <strong>{position} students</strong> on the queue.</Typography>
                            <Typography style={{padding: "0.5em", paddingLeft: "2em"}}>The estimated wait time is <strong>{waitTime} minutes</strong>.</Typography>
                        </div>
                    </Toolbar>
                </CardContent>
            </Card>
        </div>
    );
}
