import PropTypes from 'prop-types';
import { Box } from '@mui/material';

import DialogShell from './DialogShell';

export default function DeleteDialog(props) {
  const { title, isOpen, onClose, handleDelete, itemName } = props;

  return (
    <DialogShell
      open={isOpen}
      onClose={onClose}
      title={title}
      primaryAction={{ label: 'Delete', variant: 'danger', onClick: handleDelete }}
      secondaryAction={{ label: 'Cancel', onClick: onClose }}
    >
      <Box sx={{ fontSize: 14 }}>
        Are you sure you want to remove <strong>{itemName}</strong>?
      </Box>
    </DialogShell>
  );
}

DeleteDialog.propTypes = {
  title: PropTypes.string,
  isOpen: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  handleDelete: PropTypes.func.isRequired,
  itemName: PropTypes.string,
};
