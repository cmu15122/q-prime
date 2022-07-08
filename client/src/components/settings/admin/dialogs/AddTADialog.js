
import React from 'react';
import {
    Box, Button, Dialog, DialogContent, FormControlLabel, Checkbox, Typography, TextField, Grid
} from '@mui/material'

import SettingsService from '../../../../services/SettingsService';

export default function AddTADialog(props) {
    const { isOpen, onClose, updateTAs } = props

    const [name, setName] = React.useState("");
    const [email, setEmail] = React.useState("");
    const [isAdmin, setIsAdmin] = React.useState(false);

    const onSubmit = event => {
        event.preventDefault();
        SettingsService.createTA(
            JSON.stringify({
                name: name,
                email: email,
                isAdmin: isAdmin
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
                <Typography sx={{ pb: 2, fontWeight: 'bold', fontSize: '22px', textAlign: 'center' }}>
                    Add New TA
                </Typography>
                <form onSubmit={onSubmit}>
                    <Grid container spacing={3} >
                        <Grid className="d-flex" item xs={8}>
                            <TextField
                                label="TA Name"
                                variant="standard"
                                required
                                fullWidth
                                value={name}
                                onChange={(e) => {
                                    setName(e.target.value)
                                }}
                            />
                        </Grid>
                        <Grid className="d-flex" align="left" item xs={4}>
                            <FormControlLabel label="Is Admin?" labelPlacement="start" control={
                                <Checkbox 
                                    checked={isAdmin}
                                    onChange={(e) => {
                                        setIsAdmin(e.target.checked);
                                    }}
                                />
                            } sx={{ pt: 1 }} />
                        </Grid>
                        <Grid className="d-flex" item xs={12}>
                            <TextField
                                label="TA Email"
                                variant="standard"
                                required
                                fullWidth
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value)
                                }}
                            />
                        </Grid>
                    </Grid>
                    <Box textAlign='center' sx={{pt: 6}}>
                        <Button type="submit" variant="contained" sx={{ alignSelf: 'center' }}>Create</Button>
                    </Box>
                </form>
            </DialogContent>
        </Dialog>
    );
}
