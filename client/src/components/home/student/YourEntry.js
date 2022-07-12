import * as React from 'react';
import {
    Typography,
    Divider,
    Card,
    CardContent,
    Stack,
    IconButton,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete';
import * as converter from 'number-to-words'

export default function YourEntry(props) {
    const waitTime = 20
    
    const { openRemoveOverlay, position, location, topic, question } = props
    return (
        <div className='card' style={{display:'flex'}}>
            <Card sx={{ minWidth : '100%'}}>
                <CardContent>
                    <Stack direction="row" display="flex">
                        <Typography variant='h5' sx={{fontWeight: 'bold', textAlign: 'left'}}>Your Entry:</Typography>
                        <IconButton sx={{color: "black", marginLeft: "auto", marginRight:".5em"}} onClick={openRemoveOverlay}>
                            <DeleteIcon />
                        </IconButton>
                    </Stack>
                    
                    <Divider sx={{marginBottom:".5em"}}/>
                    
                    <Typography variant='h6' sx={{textAlign:'left'}}>You are <strong>{converter.toOrdinal(position)} in line</strong>.</Typography>
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
