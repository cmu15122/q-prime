import {
    Button, Stack
} from '@mui/material';

import PersistentOptions from './PersistentOptions';

export default function LeapStudentActions(props) {
    const {
        approveCooldownOverride
    } = props;
    
    return (
        <Stack
            direction={{ xs: "column", sm: "row" }}
            sx={{ mt: { xs: 1, sm: 0 }, alignItems: 'center', justifyContent: 'flex-end' }}
        >
            <Button color="success" variant="contained" onClick={() => approveCooldownOverride()} sx={{ m: 0.5 }}>
                Approve
            </Button>
            {PersistentOptions(props)}
        </Stack>
    );
}
