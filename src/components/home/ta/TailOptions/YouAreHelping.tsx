import { Button, Stack } from '@mui/material';

export default function YouAreHelping(props) {
  const { removeRef, removeStudent, index, handleCancel, theme, tempDisabled } = props;

  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      sx={{ alignItems: 'center', justifyContent: 'flex-end' }}
    >
      <Button
        disabled={tempDisabled}
        variant="contained"
        style={{ background: theme.alternateColors.cancel }}
        sx={{ m: 0.5 }}
        onClick={() => handleCancel(index)}
      >
        Cancel
      </Button>
      <Button
        disabled={tempDisabled}
        variant="contained"
        color="info"
        sx={{ m: 0.5 }}
        ref={removeRef}
        onClick={() => removeStudent(index, true)}
      >
        Done
      </Button>
    </Stack>
  );
}
