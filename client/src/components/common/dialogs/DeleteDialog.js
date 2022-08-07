import React from "react";
import PropTypes from "prop-types";
import {
    Box, Button, Dialog, DialogContent, Typography
} from "@mui/material";

export default function DeleteDialog(props) {
    const { isOpen, onClose, handleDelete, title, itemName } = props

    return (
        <Dialog
            open={isOpen}
            onClose={onClose}
        >
            <DialogContent>
                <Typography variant="h5" sx={{ pb: 3, fontWeight: 'bold', textAlign: 'center' }}>
                    {title}
                </Typography>
                <Typography sx={{ textAlign: 'center' }}>
                    Are you sure you want to remove <strong>{itemName}</strong>? 
                    <br/>
                    This action cannot be undone.
                </Typography>
                <Box textAlign='center' sx={{ pt: 5 }}>
                    <Button onClick={handleDelete} variant="contained" color="error" sx={{ alignSelf: 'center' }}>Delete</Button>
                </Box>
            </DialogContent>
        </Dialog>
    );
}

DeleteDialog.propTypes = {
    isOpen: PropTypes.bool,
    onClose: PropTypes.func.isRequired,
    handleDelete: PropTypes.func.isRequired
};
