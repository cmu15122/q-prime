import * as React from 'react';
import {
    Button, Dialog, DialogContent, Stack, Typography,
} from '@mui/material';

export default function RemoveQOverlay(props) {
    const { open, handleClose, removeFromQueue } = props;

    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogContent>
                <Typography sx={{ pb: 3, fontWeight: 'bold', fontSize: '22px', textAlign: 'center' }}>
                    Remove your question from the queue?
                </Typography>
                <Typography sx={{ textAlign: 'center' }}>
                    You will forfeit your position on the queue.
                </Typography>
                <Stack direction="row" spacing={4} sx={{pt: 4}} justifyContent="center">
                    <Button variant="contained" onClick={handleClose}>Cancel</Button>
                    <Button color="error" variant="contained" onClick={() => {
                        handleClose(); 
                        removeFromQueue();
                    }}>Remove</Button>
                </Stack>
            </DialogContent>
        </Dialog>
    );
}
