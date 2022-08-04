import {
    Stack
} from '@mui/material';

import YouAreHelping from './TailOptions/YouAreHelping';
import ActionsHelp from './TailOptions/ActionsHelp';
import ActionsFreeze from './TailOptions/ActionsFreeze';
import StudentStatus from './TailOptions/StudentStatus';
import LeapStudentActions from './TailOptions/LeapStudentActions';

export default function EntryTails(props) {
    const {
        theme, student, index, isHelping, helpIdx
    } = props;

    const status = student.status;

    const getCorrectTail = (status) => {
        switch (status) {
            case 0: {
                if (isHelping && (index === helpIdx)) {
                    return (YouAreHelping(props));
                } else {
                    return (ActionsHelp(props));
                }
            }
            case 1: return (ActionsHelp(props));
            case 2: return (ActionsHelp(props));    
            case 3: return (ActionsFreeze(props));        
            case 4: return (LeapStudentActions(props));
            case 5: return (ActionsHelp(props));
            default: return;
        }
    }

    return (
        <Stack 
            direction="column"
            align="center"
            sx={{ mr: {xs: 1, sm: 2, lg: 3}, ml: {xs: 1, sm: 2} }}
        >
            <StudentStatus student={student} theme={theme} index={index} isHelping={isHelping} helpIdx={helpIdx}/>
            {getCorrectTail(status)}
        </Stack>
    );
}
