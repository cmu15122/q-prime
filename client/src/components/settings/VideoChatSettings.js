import React, { useState } from 'react';
import {
    Button, FormGroup, FormControlLabel, Checkbox, Card, CardContent, Typography, TextField, Grid
} from '@mui/material'


export default function VideoChatSettings(props) {
    const { } = props
    return (
        <div className='card' style={{ display: 'flex' }}>
            <Card sx={{ minWidth: '100%', mt: 10 }}>
                <CardContent>
                    <Typography sx={{ fontSize: 16, fontWeight: 'bold', ml: 1, mt: 1}} variant="h5" gutterBottom>
                        Video Chat Settings
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid className="d-flex" item sx={{ mt: 1, ml: 1 }} xs={9.5}>
                            <TextField id="video-chat-url" placeholder="Video Chat URL" variant="standard" fullWidth/>
                        </Grid>
                        <Grid className="d-flex" item sx={{ mt: 1, mx: 1 }} xs={2}>
                            <Button variant="contained">Save</Button>
                        </Grid>
                    </Grid>
                    <FormGroup>
                        <FormControlLabel control={<Checkbox size="small" sx={{ ml: 1}}/>} label="Enable video chat" sx={{mt: 1}}/>
                    </FormGroup>
                </CardContent>
            </Card>
        </div>
    );
}