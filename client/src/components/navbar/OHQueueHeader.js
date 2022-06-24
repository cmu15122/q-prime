import React, { useState } from 'react';
import {
    Box, Link
} from '@mui/material'

export default function OHQueueHeader(props) {
    const {} = props;
    return (
        <Link variant="h6" color="#FFFFFF" fontWeight='bold' href="/" underline="none">
            15-122 Office Hours Queue
        </Link>
    );
}
