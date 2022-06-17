
import React from 'react';
import {
    Box, Button, Dialog, DialogContent, Typography
} from '@mui/material'

export default function DeleteTopicDialog(props) {
    const { isOpen, onClose, topicInfo, updateTopics } = props

    const callDeleteTopicAPI = async () => {
        const response = await fetch('http://localhost:8000/settings/topics/delete', 
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                  },
                body: JSON.stringify({
                    assignment_id: topicInfo.assignment_id,
                })
            });
        const body = await response.json();
  
        if (response.status !== 200) {
            throw Error(body.message);
        }

        updateTopics(body.topics);
        onClose();
    };

    return (
        <Dialog
            open={isOpen}
            onClose={onClose}
        >
            <DialogContent>
                <Typography sx={{ pb: 3, fontWeight: 'bold', fontSize: '22px', textAlign: 'center' }}>
                    Delete Topic
                </Typography>
                <Typography sx={{ textAlign: 'center' }}>
                    Are you sure you want to remove <strong>{" " + topicInfo?.name}</strong>? 
                    <br/>
                    This action cannot be undone.
                </Typography>
                <Box textAlign='center' sx={{pt: 5}}>
                    <Button onClick={callDeleteTopicAPI} variant="contained" color="error" sx={{ alignSelf: 'center' }}>Delete</Button>
                </Box>
            </DialogContent>
        </Dialog>
    );
}
