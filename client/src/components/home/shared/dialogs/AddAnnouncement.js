
import React, { useState } from 'react';
import {
    Box, Button, Dialog, DialogContent, Typography, TextField, Grid
} from '@mui/material'

import HomeService from '../../../../services/HomeService';

export default function AddAnnouncement(props) {
    const { isOpen, onClose } = props

    const [content, setContent] = useState("");

    const onSubmit = event => {
        event.preventDefault();
        HomeService.createAnnouncement(
            JSON.stringify({
                content: content
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
                <Typography sx={{ pb: 1, fontWeight: 'bold', fontSize: '22px', textAlign: 'center' }}>
                    Create New Announcement
                </Typography>
                <form onSubmit={onSubmit}>
                    <Grid container spacing={3}>
                        <Grid className="d-flex" item xs={12}>
                            <TextField 
                                label="Content"
                                variant="standard"
                                required
                                multiline
                                fullWidth
                                onChange={(event) => setContent(event.target.value)}
                            />
                        </Grid>
                    </Grid>
                    <Box textAlign='center' sx={{pt: 6}}>
                        <Button type="submit" variant="contained" sx={{ alignSelf: 'center' }} >Create</Button>
                    </Box>
                </form>
            </DialogContent>
        </Dialog>
    );
}
