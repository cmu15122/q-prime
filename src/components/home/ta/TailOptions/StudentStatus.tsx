import { Box } from '@mui/material';

import { Doc } from '../../../../../convex/_generated/dataModel';

const STATUS_LABEL: Partial<Record<Doc<'ohq'>['status'], string>> = {
  fixing_question: 'Updating',
  frozen: 'Frozen',
  cooldown_violation: 'Cooldown',
};

export default function StudentStatus(props: { student: Doc<'ohq'>; isOwnHelp: boolean }) {
  const { student, isOwnHelp } = props;
  const status = student.status;

  // Other TA's helping → small caption with their name; the timer (if shown) sits in the action row.
  if (status === 'being_helped' && !isOwnHelp) {
    return (
      <Box
        sx={(theme) => ({
          fontFamily: theme.fonts.mono,
          fontSize: 11,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: theme.palette.ink.muted,
        })}
      >
        {student.helping_ta?.preferred_name} helping
      </Box>
    );
  }

  const label = STATUS_LABEL[status];
  if (!label) return null;

  return (
    <Box
      sx={(theme) => ({
        fontFamily: theme.fonts.mono,
        fontSize: 11,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: theme.palette.ink.muted,
      })}
    >
      {label}
    </Box>
  );
}
