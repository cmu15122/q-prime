import React from 'react';
import PropTypes from 'prop-types';
import {
  Card,
} from '@mui/material';

export default function BaseCard(props) {
  const {children} = props;

  return (
    <div className='card' style={{display: 'flex'}}>
      <Card sx={{width: '100%', overflow: 'hidden'}}>
        {children}
      </Card>
    </div>
  );
}

BaseCard.propTypes = {
  children: PropTypes.node,
};
