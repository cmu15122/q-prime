import {
  Button, Stack
} from '@mui/material';

import PersistentOptions from './PersistentOptions';

export default function ActionsFreeze(props) {
    const {
        index, handleClickUnfreeze
    } = props;

    return (
        <Stack
            direction={{ xs: "column", sm: "row" }}
            sx={{ alignItems: 'center', justifyContent: 'flex-end' }}
        >
            <Button color="unfreeze" variant="contained" onClick={() => handleClickUnfreeze(index)} sx={{ m: 0.5 }}>
                Unfreeze
            </Button>
            {PersistentOptions(props)}
        </Stack>
    );
}
