import PropTypes from 'prop-types';
import { Box, Divider } from '@mui/material';

import BaseCard from '../cards/BaseCard';
import { t, s } from '../../../themes/styles';

// A titled card whose body is a vertical list of arbitrary rows. Used for the
// TA queue, where each row lays out its own columns (CSS grid) instead of
// sharing a global HTML-table column grid.
export default function ListCard(props) {
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
      <Box role="list">{children}</Box>
    </BaseCard>
  );
}

ListCard.propTypes = {
  title: PropTypes.string,
  HeaderTailComp: PropTypes.elementType,
  children: PropTypes.node,
};
