import React, { useState, useEffect, useRef } from 'react';
import {
  TableRow, TableCell
} from '@mui/material';

import EntryTails from './EntryTails';

export default function StudentEntry(props) {
    const { theme, student, index, handleClickHelp, removeStudent, handleClickUnfreeze } = props;

    const [confirmRemove, setConfirmRemove] = useState(false);
    const removeRef = useRef();

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

    return (
        <TableRow
            key={student.andrewID}
            style={index % 2 ? { background: theme.palette.background.paper } : { background: theme.palette.background.default }}
        >
            <TableCell padding='none' component="th" scope="row" sx={{ px: {xs: 2, sm: 3}, fontSize: '15px', width: '15%' }}>
                {student.name} ({student.andrewID})
            </TableCell>
            <TableCell padding='none' align="left" sx={{ pt: 2, pb: 2, fontSize: '15px', width: "100%" }} style={{ wordBreak: "break-all" }}>
                {`[${student.topic}] ${student.question}`}
            </TableCell>
            <TableCell padding='none' sx={{ pt: 1, pb: 1 }}>
                {
                    EntryTails({
                        ...props,
                        removeRef: removeRef,
                        confirmRemove: confirmRemove,
                        handleRemoveButton: handleRemoveButton,
                        removeStudent: removeStudent,
                        handleClickHelp: handleClickHelp,
                        handleClickUnfreeze: handleClickUnfreeze
                    })
                }
            </TableCell>
        </TableRow>
    );
}
