import { TableCell, TableRow, useTheme } from '@mui/material';

import OhqButton from '../buttons/OhqButton';

export default function AddRow(props) {
  const { addButtonLabel, handleAdd } = props;
  const theme = useTheme();

  return (
    <TableRow key="add" style={{ background: theme.palette.background.default }}>
      <TableCell align="center" colSpan={5}>
        <OhqButton variant="primary" onClick={() => handleAdd()}>
          {addButtonLabel}
        </OhqButton>
      </TableCell>
    </TableRow>
  );
}
