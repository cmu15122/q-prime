
import React from 'react';
import {
    Box, Button, Dialog, DialogContent, Typography
} from '@mui/material'

import SettingsService from '../../../../services/SettingsService';

export default function DeleteTopicDialog(props) {
    const { isOpen, onClose, taInfo, updateTAs } = props

    const handleDelete = () => {
        SettingsService.deleteTA(
            JSON.stringify({
                user_id: taInfo.user_id
            })
        ).then(res => {
            updateTAs(res.data.tas);
            onClose();
        });
    };

    return (
        <Dialog
            open={isOpen}
            onClose={onClose}
        >
            <DialogContent>
                <Typography sx={{ pb: 3, fontWeight: 'bold', fontSize: '22px', textAlign: 'center' }}>
                    Delete TA
                </Typography>
                <Typography sx={{ textAlign: 'center' }}>
                    Are you sure you want to remove <strong>{" " + taInfo?.name}</strong>? 
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
