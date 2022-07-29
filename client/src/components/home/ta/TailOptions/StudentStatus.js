import {
    Typography
} from '@mui/material';

export default function StudentStatus(props) {
    const { student, theme, index, isHelping, helpIdx } = props;
    const status = student.status;

    const chooseText = (status) => {
        switch (status) {
            case 0: {
                if (isHelping && (index === helpIdx)) {
                    return 'You are helping';
                } else {
                    return 'TA is Helping';
                }
            }
            case 2: return 'Updating Question';
            case 3: return 'Frozen';
            case 4: return 'Joined Before Cooldown';
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
