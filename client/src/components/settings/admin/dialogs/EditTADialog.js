
import React from 'react';
import {
    Box, Button, Dialog, DialogContent, FormControlLabel, Checkbox, Typography, TextField, Grid
} from '@mui/material'

import SettingsService from '../../../../services/SettingsService';

export default function EditTADialog(props) {
    const { isOpen, onClose, taInfo, updateTAs } = props

    const [name, setName] = React.useState("");
    const [email, setEmail] = React.useState("");
    const [isAdmin, setIsAdmin] = React.useState(false);

    React.useEffect(() => {
        if (taInfo != null) {
            setName(taInfo.name);
            setEmail(taInfo.email);
            setIsAdmin(taInfo.isAdmin);
        }
    }, [taInfo]);

    const handleUpdate = () => {
        SettingsService.updateTA(
            JSON.stringify({
                user_id: taInfo.user_id,
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
                    Edit TA Info
                </Typography>
                <Grid container spacing={3} >
                    <Grid className="d-flex" item xs={8}>
                        <TextField
                            label="TA Name"
                            variant="standard"
                            required
                            fullWidth
                            value={name}
                            InputProps={{
                                readOnly: true,
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
                            InputProps={{
                                readOnly: true,
                            }}
                        />
                    </Grid>
                </Grid>
                <Box textAlign='center' sx={{pt: 6}}>
                    <Button onClick={handleUpdate} variant="contained" color="info" sx={{ alignSelf: 'center' }} >Save</Button>
                </Box>
            </DialogContent>
        </Dialog>
    );
}
