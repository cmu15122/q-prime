import PropTypes from 'prop-types';
import { Box } from '@mui/material';

import DialogShell from './DialogShell';

const FORM_ID = 'ohq-edit-dialog-form';

export default function EditDialog(props) {
  const { isOpen, onClose, handleEdit, title, children } = props;

  return (
    <DialogShell
      open={isOpen}
      onClose={onClose}
      title={title}
      primaryAction={{ label: 'Save', type: 'submit', formId: FORM_ID }}
      secondaryAction={{ label: 'Cancel', onClick: onClose }}
    >
      <Box component="form" id={FORM_ID} onSubmit={handleEdit}>
        {children}
      </Box>
    </DialogShell>
  );
}

EditDialog.propTypes = {
  title: PropTypes.string,
  isOpen: PropTypes.bool,
  children: PropTypes.node,
  onClose: PropTypes.func.isRequired,
  handleEdit: PropTypes.func.isRequired,
};
