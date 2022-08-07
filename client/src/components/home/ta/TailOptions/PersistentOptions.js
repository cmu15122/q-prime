import {
    IconButton, Button, Stack
} from '@mui/material';

import {
    Delete
} from '@mui/icons-material';

import ExtraStudentOptions from './ExtraStudentOptions';

export default function PersistentOptions(props) {
    const {
        student, removeRef, confirmRemove, handleRemoveButton
    } = props;

    return (
        <Stack direction="row" sx={{alignItems: 'center', justifyContent:'flex-end', justifySelf: 'flex-end'}}>
            <div ref={removeRef} onClick={() => handleRemoveButton()}>
                {
                    confirmRemove ?
                    (<Button color="error" variant="contained" sx={{ m: 0.5 }}>Remove</Button>)
                    :
                    (<IconButton color="error"><Delete/></IconButton>)
                }
            </div>
            <ExtraStudentOptions student={student}></ExtraStudentOptions>
        </Stack>
    );
}
