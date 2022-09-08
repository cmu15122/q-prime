import {
    Button, Stack
} from '@mui/material';

export default function YouAreHelping(props) {
    const {
        removeRef, removeStudent, index, handleCancel,
    } = props;
    
    return (
        <Stack
            direction={{ xs: "column", sm: "row" }}
            sx={{ alignItems: 'center', justifyContent: 'flex-end' }}
        >
            <Button variant='contained' color='cancel' sx={{ m: 0.5 }} onClick={() => handleCancel(index)}>
                Cancel
            </Button>
            <Button variant='contained' color='info' sx={{ m: 0.5 }} ref={removeRef} onClick={() => removeStudent(index)}>
                Done
            </Button>
        </Stack>
    );
}
