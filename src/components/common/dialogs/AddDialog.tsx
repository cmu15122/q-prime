import PropTypes from 'prop-types';
import { Box } from '@mui/material';

import DialogShell from './DialogShell';

const FORM_ID = 'ohq-add-dialog-form';

export default function AddDialog(props) {
  const { isOpen, onClose, handleCreate, title, children } = props;

  return (
    <DialogShell
      open={isOpen}
      onClose={onClose}
      title={title}
      primaryAction={{ label: 'Add', type: 'submit', formId: FORM_ID }}
      secondaryAction={{ label: 'Cancel', onClick: onClose }}
    >
      <Box component="form" id={FORM_ID} onSubmit={handleCreate}>
        {children}
      </Box>
    </DialogShell>
  );
}

AddDialog.propTypes = {
  title: PropTypes.string,
  isOpen: PropTypes.bool,
  children: PropTypes.node,
  onClose: PropTypes.func.isRequired,
  handleCreate: PropTypes.func.isRequired,
};
