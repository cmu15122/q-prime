import React from 'react';
import PropTypes from 'prop-types';
import {
  CardActions, Divider,
  Table, TableBody, Typography,
} from '@mui/material';

import BaseCard from '../cards/BaseCard';

export default function BaseTable(props) {
  const {title, children, HeaderTailComp} = props;

  return (
    <BaseCard>
      <CardActions style={{justifyContent: 'space-between', alignItems: 'center'}}>
        <Typography sx={{fontWeight: 'bold', ml: 2, mt: 1}} variant="h5" gutterBottom>
          {title}
        </Typography>
        <HeaderTailComp />
      </CardActions>
      <Divider></Divider>
      <Table>
        <TableBody>
          {children}
        </TableBody>
      </Table>
    </BaseCard>
  );
}

BaseTable.propTypes = {
  title: PropTypes.string,
  HeaderTailComp: PropTypes.elementType.isRequired,
  children: PropTypes.node,
};
