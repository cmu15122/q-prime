import PropTypes from "prop-types";
import {
    Box, Button, Dialog, DialogContent, Stack, TextField, Typography 
} from "@mui/material";

export default function UploadDialog(props) {
    const { isOpen, onClose, handleUpload, file, setFile, fileName, setFileName } = props;

    const handleChange = (event) => {
        const files = Array.from(event.target.files);
        const [file] = files;

        setFile(file);
        setFileName((file as any).name);
    };

    return (
        <Dialog
            open={isOpen}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
        >
            <DialogContent>
                <Typography variant="h5" sx={{ pb: 3, fontWeight: 'bold', textAlign: 'center' }}>
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

UploadDialog.propTypes = {
    title: PropTypes.string,
    isOpen: PropTypes.bool,
    onClose: PropTypes.func.isRequired,
    handleUpload: PropTypes.func.isRequired,
    file: PropTypes.any.isRequired,
    setFile: PropTypes.func.isRequired, 
    fileName: PropTypes.string.isRequired, 
    setFileName: PropTypes.func.isRequired,
    children: PropTypes.node,
};
