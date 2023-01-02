import React, { useContext } from 'react';
import {
  Typography, Divider, CardContent, Stack, IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import PauseIcon from '@mui/icons-material/Pause';
import {styled} from '@mui/material/styles';

import BaseCard from '../../common/cards/BaseCard';

import * as converter from 'number-to-words';

import {QueueDataContext, StudentDataContext} from '../../../App';

const CustomDivider = styled(Divider)({
  marginTop: '.5em',
  marginBottom: '.5em',
});

export default function YourEntry(props) {
  const {openRemoveOverlay} = props;
  const {queueData} = useContext(QueueDataContext);
  const {studentData} = useContext(StudentDataContext);

  console.log(studentData.position);

  return (
    <BaseCard>
      <CardContent sx={{m: 1, textAlign: 'left'}}>
        <Stack direction='row' display='flex' alignItems='center'>
          <Typography variant='h5' sx={{fontWeight: 'bold', pr: 1}}>Your Entry:</Typography>
          <Typography variant='h5'>You are <strong>{converter.toOrdinal(studentData.position+1)} in line</strong></Typography>
          <IconButton color='error' sx={{marginLeft: 'auto', marginRight: '.5em'}} onClick={openRemoveOverlay}>
            <DeleteIcon />
          </IconButton>
        </Stack>
        <Typography variant='h6'>The estimated time until you are helped is <strong>{Math.floor(queueData.minsPerStudent / queueData.numTAs * studentData.position)} minutes</strong></Typography>
        {
          studentData.isFrozen &&
            <div>
              <CustomDivider/>
              <Stack direction='row' display='flex' alignItems='center'>
                <PauseIcon color='error' sx={{pr: 1}} />
                <Typography color='error' sx={{fontWeight: 'bold'}}>
                        You have been frozen in line. This means you will not advance in the queue
                        until a TA approves your entry.
                </Typography>
              </Stack>
            </div>
        }
        <CustomDivider/>
        <Typography variant='h6'><strong>Location:</strong> {studentData.location}</Typography>
        <Typography variant='h6'><strong>Topic:</strong> {studentData.topic}</Typography>
        <CustomDivider/>
        <Typography variant='h6' sx={{fontWeight: 'bold'}}>Question:</Typography>
        <Typography variant='h6' style={{whiteSpace: 'pre-line'}}>{studentData.question}</Typography>
      </CardContent>
    </BaseCard>
  );
}
