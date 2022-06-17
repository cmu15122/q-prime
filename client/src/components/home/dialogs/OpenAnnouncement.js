
import React from 'react';
import {
    Box, Button, Dialog, DialogContent, Typography
} from '@mui/material'

export default function OpenAnnouncement(props) {
    const { isOpen, onMarkRead, onClose, announcementInfo } = props

    return (
        <Dialog
            open={isOpen}
            onClose={onClose}
        >
            <DialogContent>
                <Typography sx={{ pb: 3, fontWeight: 'bold', fontSize: '22px', textAlign: 'center' }}>
                    {announcementInfo?.header}
                </Typography>
                <Typography sx={{ textAlign: 'center' }}>
                    {announcementInfo?.content}
                </Typography>
                <Box textAlign='center' sx={{pt: 5}}>
                    <Button onClick={onMarkRead} variant="contained" color="error" sx={{ alignSelf: 'center' }}>{announcementInfo?.markedRead ? 'Close' : 'Mark As Read'}</Button>
                </Box>
            </DialogContent>
        </Dialog>
    );
}
