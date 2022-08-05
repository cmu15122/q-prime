import React from "react";
import {
    Box, Button, Dialog, DialogContent, Stack, TextField, Typography 
} from "@mui/material";

export default function UploadDialog(props) {
    const { isOpen, onClose, handleUpload, file, setFile, fileName, setFileName } = props;

    const handleChange = (event) => {
        const files = Array.from(event.target.files);
        const [file] = files;

        setFile(file);
        setFileName(file.name);
    };

    return (
        <Dialog
            open={isOpen}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
        >
            <DialogContent>
                <Typography sx={{ pb: 3, fontWeight: 'bold', fontSize: '22px', textAlign: 'center' }}>
                    Upload File
                </Typography>
                <form onSubmit={handleUpload}>
                    <Stack direction="row" justifyContent="flex-start" alignItems="center" spacing={2}>
                        <Button variant="contained" component="label">
                            Select File
                            <input type="file" hidden accept=".csv" onChange={handleChange}/>
                        </Button>
                        <TextField
                            variant="standard"
                            InputProps={{ disableUnderline: true }}
                            disabled
                            value={fileName || ""}
                        />
                    </Stack>
                    <Box textAlign='center' sx={{ pt: 5 }}>
                        <Button type="submit" variant="contained" sx={{ alignSelf: 'center' }} disabled={!file}>Upload</Button>
                    </Box>
                </form>
            </DialogContent>
        </Dialog>
    );
}
