import PropTypes from 'prop-types';
import { Box, Divider, Table, TableBody } from '@mui/material';

import BaseCard from '../cards/BaseCard';
import { t, s } from '../../../themes/styles';

export default function BaseTable(props) {
  const { title, children, HeaderTailComp } = props;

  return (
    <BaseCard>
      <Box sx={{ ...s.cardHeader, alignItems: 'center' }}>
        <Box component="h2" sx={[t.cardTitle, { minWidth: 0 }]}>
          {title}
        </Box>
        {HeaderTailComp && (
          <Box sx={{ flexShrink: 0 }}>
            <HeaderTailComp />
          </Box>
        )}
      </Box>
      <Divider />
      <Table sx={{ width: '100%', tableLayout: 'fixed' }}>
        <TableBody>{children}</TableBody>
      </Table>
    </BaseCard>
  );
}

BaseTable.propTypes = {
  title: PropTypes.string,
  HeaderTailComp: PropTypes.elementType,
  children: PropTypes.node,
};
