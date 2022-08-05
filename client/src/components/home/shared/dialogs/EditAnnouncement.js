
import React, { useState, useEffect } from 'react';
import {
    Box, Button, Dialog, DialogContent, Typography, TextField, Grid
} from '@mui/material'

import HomeService from '../../../../services/HomeService';

export default function EditAnnouncement(props) {
    const { isOpen, onClose, announcementInfo } = props

    const [content, setContent] = useState("");

    useEffect(() => {
        if (announcementInfo != null) {
            setContent(announcementInfo.content);
        }
    }, [announcementInfo]);

    const onSubmit = event => {
        event.preventDefault();
        HomeService.updateAnnouncement(
            JSON.stringify({
                id: announcementInfo.id,
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
                    Edit Announcement Info
                </Typography>
                <form onSubmit={onSubmit}>
                    <Grid container spacing={3}>
                        <Grid className="d-flex" item xs={12}>
                            <TextField 
                                label="Content"
                                defaultValue={announcementInfo?.content}
                                variant="standard"
                                required
                                multiline
                                fullWidth
                                onChange={(event) => setContent(event.target.value)}
                            />
                        </Grid>
                    </Grid>
                    <Box textAlign='center' sx={{pt: 6}}>
                        <Button type="submit" variant="contained" color="info" sx={{ alignSelf: 'center' }} >Save</Button>
                    </Box>
                </form>
            </DialogContent>
        </Dialog>
    );
}
