
import React from 'react';
import {
    Button, Card, CardContent, Typography, TextField, Grid
} from '@mui/material'

export default function ConfigSettings(props) {
    const { } = props
    return (
        <div className='card' style={{ display:'flex' }}>
            <Card sx={{ minWidth: '100%' }}>
                <CardContent>
                    <Typography sx={{ fontSize: 16, fontWeight: 'bold', ml: 1, mt: 1 }} variant="h5" gutterBottom>
                        Config Settings
                    </Typography>
                    <Grid container spacing={2} >
                        <Grid className="d-flex" item sx={{ mt: 1, mx: 1 }} xs={12}>
                            Current Semester:
                            <TextField id="current-sem" variant="standard" sx={{ ml: 1, mt: -1 }} style={{ width: '80px' }}/>
                            <Button variant="contained" sx={{ ml: 1, mt: -1 }}>Save</Button>
                        </Grid>
                        <Grid className="d-flex" item sx={{ mx: 1 }} xs={12}>
                            <TextField id="slack-url" placeholder="Slack Webhook URL" variant="standard" fullWidth/>
                        </Grid>
                        <Grid className="d-flex" item sx={{ mx: 1, mb: 1 }} xs={12}>
                            <TextField id="questions-url" placeholder="Questions Guide URL" variant="standard" fullWidth/>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        </div>
    );
}
