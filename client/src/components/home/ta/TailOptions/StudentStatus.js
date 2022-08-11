import {
    Typography
} from '@mui/material';

import { StudentStatusValues } from '../../../../services/StudentStatus';

export default function StudentStatus(props) {
    const { student, theme, index, isHelping, helpIdx } = props;
    const status = student.status;

    const chooseText = (status) => {
        switch (status) {
            case StudentStatusValues.BEING_HELPED: {
                if (isHelping && (index === helpIdx)) {
                    return 'You are helping';
                } else {
                    return `${student.taAndrewID} is Helping`;
                }
            }
            case StudentStatusValues.FIXING_QUESTION: return 'Updating Question';
            case StudentStatusValues.FROZEN: return 'Frozen';
            case StudentStatusValues.COOLDOWN_VIOLATION: return 'Joined Before Cooldown';
            case StudentStatusValues.RECEIVED_MESSAGE: return 'Received Message';
            default: return '';
        }
    }

    return (
        <Typography 
            fontSize='13px'
            color={theme.palette.success.main}
            style={{ overflowWrap: "break-word" }}
            sx={{ mt: 1 }}
        >
            {chooseText(status)}
        </Typography>
    );
}
