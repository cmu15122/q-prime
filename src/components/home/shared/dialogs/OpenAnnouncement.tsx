import { Typography } from '@mui/material';

import DialogShell from '../../../common/dialogs/DialogShell';

export default function OpenAnnouncement(props) {
  const { isOpen, onMarkRead, onClose, announcementInfo } = props;

  return (
    <DialogShell
      open={isOpen}
      onClose={onClose}
      title="Course update"
      primaryAction={{
        label: announcementInfo?.markedRead ? 'Close' : 'Mark as read',
        onClick: onMarkRead,
      }}
    >
      <Typography sx={{ fontSize: 14, color: 'ink.primary', whiteSpace: 'pre-line' }}>
        {announcementInfo?.content}
      </Typography>
    </DialogShell>
  );
}
