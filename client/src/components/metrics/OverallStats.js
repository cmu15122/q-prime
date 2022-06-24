import React, { useState } from 'react';
import {
   Card, Divider, Typography, Grid
} from '@mui/material'

export default function OverallStats(props) {
    const { theme } = props;

    return (
        <div>
            <Typography variant="h5" sx={{ mt: 4, ml: 10 }} fontWeight='bold'>
                Overall Statistics For OH Session
            </Typography>
            <Card
                sx={{
                display: 'flex',
                alignItems: 'center',
                maxWidth: '100%',
                border: (theme) => `1px solid ${theme.palette.divider}`,
                borderRadius: 1,
                mt: 4,
                mx: 13,
                overflow: 'hidden'
                }}
            >
                <Grid sx={{ px: 4, py: 4, alignItems: 'center', textAlign: 'center' }}>
                    <Typography variant='h6' wrap fontWeight='bold'>Number of Students on Queue</Typography>
                    <Typography variant='h3' wrap sx={{ mt: 2 }} fontWeight='bold'>100</Typography>
                </Grid>
                <Divider orientation="vertical" variant="middle" flexItem />
                <Grid sx={{ px: 4, py: 4, alignItems: 'center', textAlign: 'center' }}>
                    <Typography variant='h6' wrap fontWeight='bold'>Proportion of Bad Questions</Typography>
                    <Typography variant='h3' wrap sx={{ mt: 2 }} fontWeight='bold'>10%</Typography>
                </Grid>
                <Divider orientation="vertical" variant="middle" flexItem />
                <Grid sx={{ px: 4, py: 4, alignItems: 'center', textAlign: 'center' }}>
                    <Typography variant='h6' wrap fontWeight='bold'>Average Waiting Time</Typography>
                    <Typography variant='h3' wrap sx={{ mt: 2 }} fontWeight='bold'>15</Typography>
                </Grid>
                <Divider orientation="vertical" variant="middle" flexItem />
                <Grid sx={{ px: 4, py: 4, alignItems: 'center', textAlign: 'center' }}>
                    <Typography variant='h6' wrap fontWeight='bold'>TA:Student Ratio</Typography>
                    <Typography variant='h3' wrap sx={{ mt: 2 }} fontWeight='bold'>1:4</Typography>
                </Grid>
            </Card>
        </div>
    );
}