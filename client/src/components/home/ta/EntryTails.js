import {
    Stack
} from '@mui/material';

import YouAreHelping from './TailOptions/YouAreHelping';
import ActionsHelp from './TailOptions/ActionsHelp';
import ActionsFreeze from './TailOptions/ActionsFreeze';
import StudentStatus from './TailOptions/StudentStatus';
import LeapStudentActions from './TailOptions/LeapStudentActions';

import { StudentStatusValues } from '../../../services/StudentStatus';

export default function EntryTails(props) {
    const {
        theme, student, index, isHelping, helpIdx
    } = props;

    const status = student.status;

    const getCorrectTail = (status) => {
        switch (status) {
            case StudentStatusValues.BEING_HELPED: {
                if (isHelping && (index === helpIdx)) {
                    return (YouAreHelping(props));
                } else {
                    return (ActionsHelp(props));
                }
            }
            case StudentStatusValues.WAITING: return (ActionsHelp(props));
            case StudentStatusValues.FIXING_QUESTION: return (ActionsHelp(props));    
            case StudentStatusValues.FROZEN: return (ActionsFreeze(props));        
            case StudentStatusValues.COOLDOWN_VIOLATION: return (LeapStudentActions(props));
            case StudentStatusValues.RECEIVED_MESSAGE: return (ActionsHelp(props));
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
