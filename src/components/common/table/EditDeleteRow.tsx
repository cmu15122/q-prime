import PropTypes from 'prop-types';
import { Stack, TableCell } from '@mui/material';

import { Edit, Delete } from '@mui/icons-material';

import ItemRow from './ItemRow';
import OhqButton from '../buttons/OhqButton';

export default function EditDeleteRow(props) {
  const { index, row, rowKey, children, handleEdit, handleDelete } = props;

  return (
    <ItemRow index={index} rowKey={rowKey}>
      {children}
      <TableCell align="right" sx={{ pr: 3 }}>
        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
          <OhqButton variant="icon" aria-label="edit" onClick={() => handleEdit(row)}>
            <Edit fontSize="small" />
          </OhqButton>
          <OhqButton
            variant="icon"
            tone="danger"
            aria-label="delete"
            onClick={() => handleDelete(row)}
          >
            <Delete fontSize="small" />
          </OhqButton>
        </Stack>
      </TableCell>
    </ItemRow>
  );
}

EditDeleteRow.propTypes = {
  index: PropTypes.number.isRequired,
  row: PropTypes.any.isRequired,
  rowKey: PropTypes.string.isRequired,
  handleEdit: PropTypes.func.isRequired,
  handleDelete: PropTypes.func.isRequired,
  children: PropTypes.node,
};
