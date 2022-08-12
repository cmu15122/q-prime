import React, { useState, useEffect, useRef } from 'react';
import {
    TableCell
} from '@mui/material';

import ItemRow from '../../common/table/ItemRow';
import EntryTails from './EntryTails';

import HomeService from '../../../services/HomeService';
import { StudentStatusValues } from '../../../services/StudentStatus';

export default function StudentEntry(props) {
    const { theme, student, index, handleClickHelp, removeStudent, handleClickUnfreeze } = props;

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

    const approveCooldownOverride = () => {
        HomeService.approveCooldownOverride(
            JSON.stringify({
                andrewID: student['andrewID']
            }
        )).then(res => {
            if (res.status === 200) {
                setShowCooldownApproval(false);
                student['status'] = StudentStatusValues.WAITING;
            }
        })
    }

    return (
        <ItemRow
            theme={theme}
            index={index}
            rowKey={student.andrewID}
        >
            <TableCell padding='none' component="th" scope="row" sx={{ fontSize: '16px', pl: 3.25, pr: 2, width: '20%' }}>
                {student.name} ({student.andrewID})
            </TableCell>
            <TableCell padding='none' align="left" sx={{ pt: 2, pb: 2, fontSize: '16px', width: '60%', pr: 2 }}>
                {`[${student.topic.name}] ${student.question}`}
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
                            approveCooldownOverride: approveCooldownOverride
                        }
                    )
                }
            </TableCell>
        </ItemRow>
    )
}
