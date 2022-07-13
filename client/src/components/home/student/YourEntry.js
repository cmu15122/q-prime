import * as React from 'react';
import {
    Typography, Divider, Card, CardContent, Stack, IconButton,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete';
import { styled } from '@mui/material/styles';

import * as converter from 'number-to-words';

const CustomDivider = styled(Divider)({
    marginTop: ".5em", 
    marginBottom: ".5em"
});

export default function YourEntry(props) {
    const waitTime = 20
    
    const { openRemoveOverlay, position, location, topic, question } = props
    return (
        <div className='card' style={{ display:'flex' }}>
            <Card sx={{ minWidth : '100%'}}>
                <CardContent sx={{ m: 1, textAlign: 'left' }}>
                    <Stack direction="row" display="flex">
                        <Typography variant='h5' sx={{ fontWeight: 'bold' }}>Your Entry:</Typography>
                        <IconButton color="error" sx={{ marginLeft: "auto", marginRight:".5em" }} onClick={openRemoveOverlay}>
                            <DeleteIcon />
                        </IconButton>
                    </Stack>
                    <CustomDivider/>
                    <Typography variant='h6'>You are <strong>{converter.toOrdinal(position)} in line</strong>.</Typography>
                    <Typography variant='h6'>The estimated wait time is <strong>{waitTime} minutes</strong> from your position.</Typography>
                    <CustomDivider/>
                    <Typography variant='h5' sx={{fontWeight: 'bold'}}>Location:</Typography>
                    <Typography variant='h6'>{location}</Typography>
                    <CustomDivider/>
                    <Typography variant='h5' sx={{fontWeight: 'bold'}}>Topic:</Typography>
                    <Typography variant='h6'>{topic}</Typography>
                    <CustomDivider/>
                    <Typography variant='h5' sx={{fontWeight: 'bold'}}>Question:</Typography>
                    <Typography variant='h6'>{question}</Typography>
                </CardContent>
            </Card>
        </div>
    );
}
