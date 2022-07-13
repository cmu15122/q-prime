
import React from 'react';
import {
    Box, Button, Dialog, DialogContent, Typography
} from '@mui/material'

import HomeService from '../../../../services/HomeService';

export default function DeleteAnnouncement(props) {
    const { isOpen, onClose, announcementInfo } = props

    const handleDelete = () => {
        HomeService.deleteAnnouncement(
            JSON.stringify({
                id: announcementInfo.id,
            })
        ).then(() => {
            onClose();
        });
    };

    return (
        <Dialog
            open={isOpen}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
        >
            <DialogContent>
                <Typography sx={{ pb: 3, fontWeight: 'bold', fontSize: '22px', textAlign: 'center' }}>
                    Delete Topic
                </Typography>
                <Typography sx={{ textAlign: 'center' }}>
                    Are you sure you want to remove announcement <strong>{" " + announcementInfo?.header}</strong>? 
                    <br/>
                    This action cannot be undone.
                </Typography>
                <Box textAlign='center' sx={{pt: 5}}>
                    <Button onClick={handleDelete} variant="contained" color="error" sx={{ alignSelf: 'center' }}>Delete</Button>
                </Box>
            </DialogContent>
        </Dialog>
    );
}
