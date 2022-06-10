import React, { useState } from 'react';
import {
    Box, Link
} from '@mui/material'

export default function OHQueueHeader(props) {
    const {} = props;
    return (
        <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            <Link variant="h6" noWrap color="#FFFFFF" fontWeight='bold' href="/" underline="none">
            15-122 Office Hours Queue
            </Link>
        </Box>
    );
}