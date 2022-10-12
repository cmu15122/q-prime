import { useState, useEffect, useRef } from 'react';
import {
    Stack, TableCell
} from '@mui/material';
import PauseIcon from '@mui/icons-material/Pause';

import EntryTails from './EntryTails';
import ItemRow from '../../common/table/ItemRow';

import HomeService from '../../../services/HomeService';
import { StudentStatusValues } from '../../../services/StudentStatus';

export default function StudentEntry(props) {
    const { student, index, handleClickHelp, removeStudent, handleClickUnfreeze } = props;

    const [confirmRemove, setConfirmRemove] = useState(false);
    const removeRef = useRef();

    const [showCooldownApproval, setShowCooldownApproval] = useState(student['status'] === StudentStatusValues.COOLDOWN_VIOLATION)

    useEffect(() => {
        const closeExpanded = e => {
            if (!e.path.includes(removeRef.current)) {
                setConfirmRemove(false);
            }
        }

        document.body.addEventListener('click', closeExpanded);
        return () => {
            document.body.removeEventListener('click', closeExpanded);
        };
    }, []);

    function handleRemoveButton() {
        if (confirmRemove) {
            setConfirmRemove(false);
            removeStudent(index);
        } else {
            setConfirmRemove(true);
        }
    }

    const handleClickUpdateQ = () => {
        console.log('handleClickUpdateQ reached');
        student['status'] = StudentStatusValues.FIXING_QUESTION
        console.log('handleClickUpdateQ done');
    }

    const approveCooldownOverride = () => {
        HomeService.approveCooldownOverride(
            JSON.stringify({
                andrewID: student['andrewID']
            }
        )).then(res => {
            if (res.status === 200) {
                setShowCooldownApproval(false);
                student.status = StudentStatusValues.WAITING;
                student.isFrozen = false;
            }
        })
    }

    return (
        <ItemRow
            index={index}
            rowKey={student.andrewID}
        >
            <TableCell padding='none' component="th" scope="row" sx={{ py: 2, pl: 3.25, pr: 2, width: '20%' }}>
                {student.name} ({student.andrewID})<br/>
                [{student.location}]
            </TableCell>
            <TableCell padding='none' align="left" sx={{ py: 2, pr: 2, width: '60%' }}>
                <Stack direction="row" alignItems="center">
                    { student.isFrozen && <PauseIcon fontSize="inherit"/> }
                    {`[${student.topic.name}] ${student.question}`}
                </Stack>
            </TableCell>
            <TableCell padding='none'>
                {
                    EntryTails(
                        {
                            ...props,
                            removeRef: removeRef,
                            confirmRemove: confirmRemove,
                            handleRemoveButton: handleRemoveButton,
                            removeStudent: removeStudent,
                            handleClickHelp: handleClickHelp,
                            handleClickUnfreeze: handleClickUnfreeze,
                            showCooldownApproval: showCooldownApproval,
                            approveCooldownOverride: approveCooldownOverride,
                            handleClickUpdateQ: handleClickUpdateQ
                        }
                    )
                }
            </TableCell>
        </ItemRow>
    )
}
