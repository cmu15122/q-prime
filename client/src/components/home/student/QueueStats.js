import * as React from 'react';
import {
    Typography,
    CardContent,
    Card,
    Toolbar
} from '@mui/material'



export default function YourEntry(props) {
    const position = 11
    const waitTime = 20
    
    const { theme } = props
    return (
        <div className='card' style={{display:'flex'}}>
            <Card sx={{ minWidth : '100%'}}>
                <CardContent>
                    <Toolbar sx={{alignItems: 'center', justifyContent:'center'}}>
                        <div>
                            <Typography variant='h5' style={{borderRight: "0.1em solid black", padding: "0.5em", paddingBottom: "0em", paddingRight: "2em"}} sx={{fontWeight: 'bold', textAlign: 'center'}}>The queue is</Typography>
                            <Typography color="green" variant='h5' style={{borderRight: "0.1em solid black", padding: "0.5em", paddingTop: "0em", paddingRight: "2em"}} sx={{fontWeight: 'bold', textAlign: 'center'}}>OPEN</Typography>
                        </div>
                        <div width="50%">
                            <Typography variant='body1' style={{padding: "0.5em", paddingLeft: "2em"}}>There are <strong>{position} students</strong> on the queue.</Typography>
                            <Typography variant='body1' style={{padding: "0.5em", paddingLeft: "2em"}}>The estimated wait time is <strong>{waitTime} minutes</strong> from the end of the queue.</Typography>
                        </div>
                    </Toolbar>
                </CardContent>
            </Card>
        </div>
    );
}
