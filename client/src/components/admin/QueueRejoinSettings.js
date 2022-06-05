
import React from 'react';
import {
    Button, Card, CardContent, Typography, TextField, Grid
} from '@mui/material'

export default function QueueRejoinSettings(props) {
    const { } = props
    return (
        <div className='card' style={{ display:'flex' }}>
            <Card sx={{ minWidth: '100%' }}>
                <CardContent>
                    <Typography sx={{ fontSize: 16, fontWeight: 'bold', ml: 1, mt: 1}} variant="h5" gutterBottom>
                        Queue Rejoin Settings
                    </Typography>
                    <Grid container spacing={1}>
                        <Grid className="d-flex" item sx={{ mt: 1, mx: 1 }} xs={12}>
                            Allow students to rejoin the queue after
                            <TextField id="current-sem" variant="standard" sx={{ mx: 1, mt: -1 }} style={{ width: '50px' }}/>
                            minutes
                            <Button variant="contained" sx={{ ml: 1, mt: -1 }}>Save</Button>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        </div>
    );
}
