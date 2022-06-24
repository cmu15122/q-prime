import React, { useState } from 'react';
import {
   Card, Divider, Typography, Grid
} from '@mui/material'

export default function CumulativeStats(props) {
    const { theme } = props;

    return (
        <div>
            <Typography variant="h5" sx={{ mt: 4, ml: 10 }} fontWeight='bold'>
                Cumulative Statistics
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
                    <Typography variant='h6' wrap fontWeight='bold'>Total No. of Questions Answered</Typography>
                    <Typography variant='h3' wrap sx={{ mt: 2 }} fontWeight='bold'>2</Typography>
                </Grid>
                <Divider orientation="vertical" variant="middle" flexItem />
                <Grid sx={{ px: 4, py: 4, alignItems: 'center', textAlign: 'center' }}>
                    <Typography variant='h6' wrap fontWeight='bold'>Average Time Spent per Question</Typography>
                    <Typography variant='h3' wrap sx={{ mt: 2 }} fontWeight='bold'>15</Typography>
                </Grid>
                <Divider orientation="vertical" variant="middle" flexItem />
                <Grid sx={{ px: 4, py: 4, alignItems: 'center', textAlign: 'center' }}>
                    <Typography variant='h6' wrap fontWeight='bold'>Average No. of OH Visits Per Student Per Week</Typography>
                    <Typography variant='h3' wrap sx={{ mt: 2 }} fontWeight='bold'>3</Typography>
                </Grid>
            </Card>
        </div>
    );
}