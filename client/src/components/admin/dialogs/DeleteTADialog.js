
import React from 'react';
import {
    Box, Button, Dialog, DialogContent, Typography
} from '@mui/material'

export default function DeleteTopicDialog(props) {
    const { isOpen, onClose, taInfo } = props

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
                    <Button onClick={onClose} variant="contained" color="error" sx={{ alignSelf: 'center' }}>Delete</Button>
                </Box>
            </DialogContent>
        </Dialog>
    );
}
