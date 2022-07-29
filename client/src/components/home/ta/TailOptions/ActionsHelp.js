import {
  Button, Stack
} from '@mui/material';

import PersistentOptions from './PersistentOptions';

export default function ActionsHelp(props) {
    const {
        student, index, isHelping, handleClickHelp
    } = props;

    return (
        <Stack
            direction={{ xs: "column", sm: "row" }}
            sx={{ mt: { xs: 1, sm: 0 }, alignItems: 'center', justifyContent: 'flex-end' }}
        >
            <Button disabled={student.status === 0 || isHelping} color="info" variant="contained" onClick={() => handleClickHelp(index)} sx={{ m: 0.5 }}>
                Help
            </Button>
            {PersistentOptions(props)}
        </Stack>
    );
}
