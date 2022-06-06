import React, { useState } from 'react';
import {
    Button, FormGroup, FormControlLabel, Checkbox, Card, CardContent, Typography, TextField, Grid
} from '@mui/material'


export default function VideoChatSettings(props) {
    const { } = props
    return (
        <div className='card' style={{ display:'flex' }}>
            <Card sx={{ minWidth: '80%', mx: 'auto', mt: 21 }}>
                <CardContent>
                    <Typography sx={{ fontSize: 16, fontWeight: 'bold', ml: 1, mt: 1}} variant="h5" gutterBottom>
                        Video Chat Settings
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid className="d-flex" item sx={{ mt: 1, mx: 1 }} xs={12}>
                            <TextField id="video-chat-url" placeholder="Video Chat URL" variant="standard" sx={{ width: '100ch'}}/>
                            <Button variant="contained" sx={{ ml: 1, mt: -1 }}>Save</Button>
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