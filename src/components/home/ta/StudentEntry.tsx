import { useState, useEffect, useRef } from 'react';
import { Stack, TableCell, Typography } from '@mui/material';
import PauseIcon from '@mui/icons-material/Pause';

import EntryTails from './EntryTails';
import ItemRow from '../../common/table/ItemRow';

import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { Doc } from '../../../../convex/_generated/dataModel';

export default function StudentEntry(props) {
  const queueData = useQuery(api.home.home_get.getQueueData);
  const student: Doc<'ohq'> = props['student'];

  const { index, handleClickHelp, removeStudent, handleClickUnfreeze, handleFix, currentTime } =
    props;

  const [confirmRemove, setConfirmRemove] = useState(false);
  const removeRef = useRef();

  const [showCooldownApproval, setShowCooldownApproval] = useState(
    queueData?.allow_cooldown_override && student.status === 'cooldown_violation',
  );

  useEffect(() => {
    const closeExpanded = (e) => {
      const path = e.path || (e.composedPath && e.composedPath());
      if (!path.includes(removeRef.current)) {
        setConfirmRemove(false);
      }
    };

    document.body.addEventListener('click', closeExpanded);
    return () => {
      document.body.removeEventListener('click', closeExpanded);
    };
  }, []);

  // Update showCooldownApproval when allowCDOverride changes
  useEffect(() => {
    setShowCooldownApproval(
      queueData?.allow_cooldown_override && student.status === 'cooldown_violation',
    );
  }, [queueData?.allow_cooldown_override, student.status]);

  function handleRemoveButton() {
    if (confirmRemove) {
      setConfirmRemove(false);
      removeStudent(index, false);
    } else {
      setConfirmRemove(true);
    }
  }

  const approveCooldownOverrideMutation = useMutation(api.home.home_mutate.approveCooldownOverride);
  const approveCooldownOverride = async () => {
    await approveCooldownOverrideMutation({
      student_id: student.student_id,
    });
  };
  return (
    <ItemRow index={index} rowKey={student._id}>
      <TableCell
        padding="none"
        component="th"
        scope="row"
        sx={{
          py: 2,
          pl: 2,
          pr: 1,
          width: '25%',
          wordBreak: 'break-word',
          verticalAlign: 'top',
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {student.student_name}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
          {student.student_email}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
          [{student.location}]
        </Typography>
      </TableCell>
      <TableCell
        padding="none"
        align="left"
        sx={{
          py: 2,
          pr: 1,
          width: '45%',
          wordBreak: 'break-word',
          verticalAlign: 'top',
        }}
      >
        <Stack direction="row" alignItems="flex-start" spacing={0.5} sx={{ flexWrap: 'wrap' }}>
          {(student.status === 'cooldown_violation' ||
            student.status === 'fixing_question' ||
            student.status === 'frozen') && <PauseIcon fontSize="small" />}
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            [{student.assignment_name}]
          </Typography>
        </Stack>
        <Typography variant="body2" sx={{ mt: 0.5 }}>
          {student.question}
        </Typography>
      </TableCell>
      <TableCell
        padding="none"
        sx={{
          width: '28%',
          verticalAlign: 'middle',
          pr: 4,
        }}
      >
        {EntryTails({
          ...props,
          removeRef: removeRef,
          confirmRemove: confirmRemove,
          handleRemoveButton: handleRemoveButton,
          removeStudent: removeStudent,
          handleClickHelp: handleClickHelp,
          handleClickUnfreeze: handleClickUnfreeze,
          handleFix: handleFix,
          showCooldownApproval: showCooldownApproval,
          approveCooldownOverride: approveCooldownOverride,
          currentTime: currentTime,
        })}
      </TableCell>
    </ItemRow>
  );
}
