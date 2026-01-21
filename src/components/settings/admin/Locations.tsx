import { useState } from 'react';
import { TableCell, Typography } from '@mui/material';

import DayPicker from './DayPicker';

import AddDialog from '../../common/dialogs/AddDialog';
import LocationDialogBody from './dialogs/LocationDialogBody';

import AddRow from '../../common/table/AddRow';
import CollapsedTable from '../../common/table/CollapsedTable';

import ItemRow from '../../common/table/ItemRow';

import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';

export default function Locations() {
  const locationData = useQuery(api.settings.settings_get.getLocations);

  const dayDictionary = locationData?.dayDictionary || {};
  const roomDictionary = locationData?.roomDictionary || {};
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const convertIdxToDays = (idxArr) => {
    return idxArr.filter((idx) => idx !== -1).map((idx) => daysOfWeek[idx]);
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

  const addLocationMutation = useMutation(api.settings.settings_mutate.addLocation);
  const handleCreate = async (event) => {
    event.preventDefault();
    await addLocationMutation({
      room: room,
    });

    handleClose();
  };

  return (
    <div>
      <CollapsedTable title="Location Settings">
        {Object.keys(roomDictionary)
          .sort()
          .map((room, index) => (
            <ItemRow key={index} index={index} rowKey={room}>
              <TableCell component="th" scope="row" sx={{ pl: 3.25 }}>
                <Typography sx={{ fontWeight: 'bold' }}>{room}</Typography>
              </TableCell>
              <TableCell component="th" align="right" sx={{ pr: 3.25 }}>
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
          ))}
        <AddRow addButtonLabel="+ Add Location" handleAdd={handleAdd} />
      </CollapsedTable>

      <AddDialog
        isOpen={openAdd}
        onClose={handleClose}
        handleCreate={handleCreate}
        title="Add New Location"
      >
        <LocationDialogBody room={room} setRoom={setRoom} />
      </AddDialog>
    </div>
  );
}
