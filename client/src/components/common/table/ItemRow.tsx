import React from 'react';
import PropTypes from 'prop-types';
import {
  TableRow, useTheme,
} from '@mui/material';

export default function ItemRow(props) {
  const {index, rowKey, children} = props;
  const theme = useTheme();

  return (
    <TableRow
      key={rowKey}
      style={ index % 2 ? {background: theme.palette.background.paper}:{background: theme.alternateColors.alternatePaper}}
    >
      {children}
    </TableRow>
  );
}

ItemRow.propTypes = {
  index: PropTypes.number.isRequired,
  rowKey: PropTypes.any.isRequired,
  children: PropTypes.node,
};
