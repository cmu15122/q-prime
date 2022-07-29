
import React from 'react';
import {
    Box, Button, Dialog, DialogContent, FormControlLabel, Checkbox, Typography, TextField, Grid
} from '@mui/material'

import SettingsService from '../../../../services/SettingsService';

export default function EditTADialog(props) {
    const { isOpen, onClose, taInfo, updateTAs } = props

    const [name, setName] = React.useState("");
    const [isAdmin, setIsAdmin] = React.useState(false);

    React.useEffect(() => {
        if (taInfo != null) {
            setName(taInfo.name);
            setIsAdmin(taInfo.isAdmin);
        }
    }, [taInfo]);

    const onSubmit = event => {
        event.preventDefault();
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
            maxWidth="sm"
            fullWidth
        >
            <DialogContent>
                <Typography sx={{ pb: 2, fontWeight: 'bold', fontSize: '22px', textAlign: 'center' }}>
                    Edit Info for TA "{name}"
                </Typography>
                <form onSubmit={onSubmit}>

                    <Grid container spacing={3} >
                        <Grid className="d-flex" align="left" item xs={4}>
                            <FormControlLabel label="Is Admin?" labelPlacement="start" control={
                                <Checkbox 
                                    checked={isAdmin}
                                    onChange={(e) => {
                                        setIsAdmin(e.target.checked);
                                    }}
                                />
                            }/>
                        </Grid>
                    </Grid>
                    <Box textAlign='center' sx={{pt: 4}}>
                        <Button type="submit" variant="contained" color="info" sx={{ alignSelf: 'center' }} >Save</Button>
                    </Box>
                </form>
            </DialogContent>
        </Dialog>
    );
}
