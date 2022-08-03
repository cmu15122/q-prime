import * as React from 'react';
import {
    Typography, Divider, Card, CardContent, Stack, IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { styled } from '@mui/material/styles';

import * as converter from 'number-to-words';

const CustomDivider = styled(Divider)({
    marginTop: ".5em", 
    marginBottom: ".5em"
});

export default function YourEntry(props) {
    const { openRemoveOverlay, position, location, topic, question } = props;

    return (
        <div className='card' style={{ display:'flex' }}>
            <Card sx={{ minWidth : '100%'}}>
                <CardContent sx={{ m: 1, textAlign: 'left' }}>
                    <Stack direction="row" display="flex" alignItems="center">
                        <Typography variant='h5' sx={{ fontWeight: 'bold', pr: 1 }}>Your Entry:</Typography>
                        <Typography variant='h5'>You are <strong>{converter.toOrdinal(position+1)} in line</strong></Typography>
                        <IconButton color="error" sx={{ marginLeft: "auto", marginRight:".5em" }} onClick={openRemoveOverlay}>
                            <DeleteIcon />
                        </IconButton>
                    </Stack>
                    <CustomDivider/>
                    <Typography variant='h6'><strong>Location:</strong> {location}</Typography>
                    <Typography variant='h6'><strong>Topic:</strong> {topic}</Typography>
                    <CustomDivider/>
                    <Typography variant='h6' sx={{fontWeight: 'bold'}}>Question:</Typography>
                    <Typography variant='h6'>{question}</Typography>
                </CardContent>
            </Card>
        </div>
    );
}
