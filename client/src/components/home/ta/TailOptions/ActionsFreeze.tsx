import {
  Button, Stack, useTheme
} from '@mui/material';

import PersistentOptions from './PersistentOptions';

export default function ActionsFreeze(props) {
    const {
        index, handleClickUnfreeze
    } = props;
    const theme = useTheme();

    return (
        <Stack
            direction={{ xs: "column", sm: "row" }}
            sx={{ alignItems: 'center', justifyContent: 'flex-end' }}
        >
            <Button style={{ background: theme.alternateColors.unfreeze }} variant="contained" onClick={() => handleClickUnfreeze(index)} sx={{ m: 0.5 }}>
                Unfreeze
            </Button>
            {PersistentOptions(props)}
        </Stack>
    );
}
