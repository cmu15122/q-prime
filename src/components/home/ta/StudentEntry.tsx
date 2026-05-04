import { Stack, TableCell, Typography } from '@mui/material';
import PauseIcon from '@mui/icons-material/Pause';

import EntryTails from './EntryTails';
import ItemRow from '../../common/table/ItemRow';
import StudentStatus from './TailOptions/StudentStatus';

import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { Doc } from '../../../../convex/_generated/dataModel';
import { useCourseId } from '../../../contexts/CourseContext';
import { t } from '../../../themes/styles';

export default function StudentEntry(props) {
  const courseId = useCourseId();
  const student: Doc<'ohq'> = props['student'];

  const { index, handleClickHelp, removeStudent, handleClickUnfreeze, handleFix, currentTime } =
    props;

  const showCooldownApproval = student.status === 'cooldown_violation';

  const userData = useQuery(api.home.home_get.getUserData, { courseId });
  const isOwnHelp =
    student.status === 'being_helped' && student.helping_ta?.ta_id === userData?.ta_data?.ta_id;

  const isPaused =
    student.status === 'cooldown_violation' ||
    student.status === 'fixing_question' ||
    student.status === 'frozen';

  const approveCooldownOverrideMutation = useMutation(api.home.home_mutate.approveCooldownOverride);
  const approveCooldownOverride = async () => {
    await approveCooldownOverrideMutation({
      courseId,
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
          py: 1.25,
          px: 1,
          pl: 2,
          width: '22%',
          wordBreak: 'break-word',
          verticalAlign: 'top',
        }}
      >
        <Typography sx={t.studentName}>{student.student_name}</Typography>
        <Typography sx={t.studentEmail}>{student.student_email}</Typography>
        <Typography sx={[t.monoLabel, { mt: '2px' }]}>[{student.location}]</Typography>
      </TableCell>
      {isPaused && (
        <TableCell
          padding="none"
          align="left"
          sx={{
            py: 1.25,
            px: 1,
            width: '10%',
            verticalAlign: 'middle',
          }}
        >
          <Stack direction="column" alignItems="center" justifyContent="center" spacing={0.5}>
            {isPaused && <PauseIcon fontSize="small" />}
            <StudentStatus student={student} isOwnHelp={isOwnHelp} />
          </Stack>
        </TableCell>
      )}
      <TableCell
        padding="none"
        align="left"
        sx={{
          py: 1.25,
          px: 1,
          width: isPaused ? '40%' : '50%',
          wordBreak: 'break-word',
          verticalAlign: 'top',
        }}
      >
        <Typography sx={t.monoTag}>[{student.assignment_name}]</Typography>
        <Typography sx={[t.bodySmall, { mt: 0.5, color: 'ink.primary' }]}>
          {student.question}
        </Typography>
      </TableCell>
      <TableCell
        padding="none"
        sx={{
          width: '28%',
          verticalAlign: 'middle',
          px: 1,
        }}
      >
        <EntryTails
          {...props}
          removeStudent={removeStudent}
          handleClickHelp={handleClickHelp}
          handleClickUnfreeze={handleClickUnfreeze}
          handleFix={handleFix}
          showCooldownApproval={showCooldownApproval}
          approveCooldownOverride={approveCooldownOverride}
          currentTime={currentTime}
        />
      </TableCell>
    </ItemRow>
  );
}
