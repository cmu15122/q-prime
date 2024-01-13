import React, {useState, useContext, useMemo} from 'react';
import {
  TableCell, Typography,
} from '@mui/material';

import DayPicker from './DayPicker';

import AddDialog from '../../common/dialogs/AddDialog';
import LocationDialogBody from './dialogs/LocationDialogBody';

import AddRow from '../../common/table/AddRow';
import CollapsedTable from '../../common/table/CollapsedTable';

import SettingsService from '../../../services/SettingsService';
import ItemRow from '../../common/table/ItemRow';
import {QueueDataContext} from '../../../contexts/QueueDataContext';

export default function Locations(props) {
  const {queueData} = useContext(QueueDataContext);
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const dayDictionary = useMemo(() => {
    if (queueData != null) {
      return queueData.locations.dayDictionary;
    } else return {};
  }, [queueData.locations]);
  const roomDictionary = useMemo(() => {
    if (queueData != null) {
      return queueData.locations.roomDictionary;
    } else return {};
  }, [queueData.locations]);

  const convertIdxToDays = (idxArr) => {
    return idxArr.map((idx) => daysOfWeek[idx]);
  };

  /** Add Dialog Functions */
  const [openAdd, setOpenAdd] = useState(false);
  const [room, setRoom] = useState('');

  const handleAdd = () => {
    setOpenAdd(true);
    setRoom('');
  };

  const handleClose = () => {
    setOpenAdd(false);
  };

  const handleCreate = (event) => {
    event.preventDefault();
    SettingsService.addLocation(
        JSON.stringify({
          room: room,
        }),
    );

    handleClose();
  };

  return (
    <div>
      <CollapsedTable
        title="Location Settings"
      >
        {
          Object.keys(roomDictionary).sort().map((room, index) => (
            <ItemRow
              key={index}
              index={index}
              rowKey={room}
            >
              <TableCell component="th" scope="row" sx={{pl: 3.25}}>
                <Typography sx={{fontWeight: 'bold'}}>
                  {room}
                </Typography>
              </TableCell>
              <TableCell component="th" align="right" sx={{pr: 3.25}}>
                <DayPicker
                  convertIdxToDays={convertIdxToDays}
                  room={room}
                  days={roomDictionary[room]}
                  daysOfWeek={daysOfWeek}
                  roomDictionary={roomDictionary}
                  dayDictionary={dayDictionary}
                />
              </TableCell>
            </ItemRow>
          ))
        }
        <AddRow
          addButtonLabel="+ Add Location"
          handleAdd={handleAdd}
        />
      </CollapsedTable>

      <AddDialog
        isOpen={openAdd}
        onClose={handleClose}
        handleCreate={handleCreate}
        title="Add New Location"
      >
        <LocationDialogBody
          room={room}
          setRoom={setRoom}
        />
      </AddDialog>
    </div>
  );
}
