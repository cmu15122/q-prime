import { useState } from 'react';
import { Button, Grid, ToggleButton, ToggleButtonGroup } from '@mui/material';

import { Delete as DeleteIcon } from '@mui/icons-material';

import { useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';

export default function DayPicker(props) {
  const { convertIdxToDays, daysOfWeek, room, roomDictionary } = props;
  const [newDays, setNewDays] = useState(convertIdxToDays(roomDictionary[room]));

  const convertDaysToIdx = (daysArr) => {
    return daysArr.map((day) => daysOfWeek.indexOf(day));
  };

  const updateLocationsMutation = useMutation(api.settings.settings_mutate.updateLocations);
  const handleDayClick = async (_event, newArr) => {
    setNewDays(newArr);

    const newRoomDictionary = roomDictionary;
    newRoomDictionary[room] = convertDaysToIdx(newArr);

    const daysOfWeekDict = {};
    for (const day of daysOfWeek) {
      daysOfWeekDict[day] = daysOfWeek.indexOf(day);
    }

    await updateLocationsMutation({
      room: room,
      days: newArr,
      daysOfWeek: daysOfWeekDict,
    });
  };

  const removeLocationMutation = useMutation(api.settings.settings_mutate.removeLocation);
  const handleRemove = async () => {
    await removeLocationMutation({
      room: room,
      days: roomDictionary[room],
    });
  };

  return (
    <Grid>
      <ToggleButtonGroup value={newDays} onChange={handleDayClick} size="small">
        {daysOfWeek.map((day) => (
          <ToggleButton color="primary" sx={{ m: 0, px: 2 }} value={day} key={day} aria-label={day}>
            {day.charAt(0)}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
      <Button onClick={() => handleRemove()}>
        <DeleteIcon color="error" />
      </Button>
    </Grid>
  );
}
