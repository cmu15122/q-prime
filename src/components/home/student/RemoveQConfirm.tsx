import { Typography } from '@mui/material';

import DialogShell from '../../common/dialogs/DialogShell';
import { t } from '../../../themes/styles';

export default function RemoveQConfirm(props) {
  const { open, handleClose, removeFromQueue } = props;

  return (
    <DialogShell
      open={open}
      onClose={handleClose}
      title="Are you sure?"
      primaryAction={{
        label: 'Remove',
        variant: 'danger',
        onClick: () => {
          handleClose();
          removeFromQueue();
        },
      }}
      secondaryAction={{ label: 'Cancel', onClick: handleClose }}
    >
      <Typography sx={t.bodyMuted}>You will forfeit your position on the queue.</Typography>
    </DialogShell>
  );
}
