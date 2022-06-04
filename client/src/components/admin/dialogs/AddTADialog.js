
import React from 'react';
import {
    Box, Button, Dialog, DialogContent, FormControlLabel, Checkbox, Typography, TextField, Grid
} from '@mui/material'

export default function AddTADialog(props) {
    const { isOpen, onClose } = props

    return (
        <Dialog
            open={isOpen}
            onClose={onClose}
        >
            <DialogContent>
                <Typography sx={{ pb: 2, fontWeight: 'bold', fontSize: '22px', textAlign: 'center' }}>
                    Add New TA
                </Typography>
                <Grid container spacing={3} >
                    <Grid className="d-flex" item xs={8}>
                        <TextField
                            label="TA Name"
                            variant="standard"
                            required
                            fullWidth
                        />
                    </Grid>
                    <Grid className="d-flex" align="left" item xs={4}>
                        <FormControlLabel label="Is Admin?" labelPlacement="start" control={<Checkbox />} fullWidth />
                    </Grid>
                    <Grid className="d-flex" item xs={12}>
                        <TextField
                            label="TA Email"
                            variant="standard"
                            required
                            fullWidth
                        />
                    </Grid>
                </Grid>
                <Box textAlign='center' sx={{pt: 6}}>
                    <Button onClick={onClose} variant="contained" sx={{ alignSelf: 'center' }}>Create</Button>
                </Box>
            </DialogContent>
        </Dialog>
    );
}
