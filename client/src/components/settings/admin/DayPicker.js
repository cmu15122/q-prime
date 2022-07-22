import React, { useState } from 'react';
import {
    Button, Grid, ToggleButton, ToggleButtonGroup
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material'
import SettingsService from '../../../services/SettingsService';

const _ = require("underscore")

export default function DayPicker(props) {
    const { convertIdxToDays, daysOfWeek, room, roomDictionary, setRoomDictionary } = props
    const [newDays, setNewDays] = useState(convertIdxToDays(roomDictionary[room]))
    
    const convertDaysToIdx = (daysArr) => {
        return daysArr.map((day) => daysOfWeek.indexOf(day))
    }

    const handleDayClick = (event, newArr) => {
        setNewDays(newArr)
        let newRoomDictionary = roomDictionary
        newRoomDictionary[room] = convertDaysToIdx(newArr)
        setRoomDictionary(newRoomDictionary)
        SettingsService.updateLocations(
            JSON.stringify({
                room: room,
                days: newArr,
                daysOfWeek: daysOfWeek
            })
        )
    }

    const handleRemove = (event) => {
        SettingsService.removeLocation(
            JSON.stringify({
                room: room,
                days: roomDictionary[room],
            })
        )
        .then(res => {
            setRoomDictionary(res.data.roomDictionary)
        });
    }

    return (
        <Grid>
            <ToggleButtonGroup
                value={newDays}
                onChange={handleDayClick}
                aria-label="text formatting"
                size='small'
            >
                {daysOfWeek.map((day) => (
                    <ToggleButton color='primary' sx={{m: 0, p: 0}} value={day} key={day} aria-label={day}>
                        <Button variant={(roomDictionary[room].includes(day)) ? 'outlined' : 'text'} size='small' sx={{m: 0, p: 0}}>{day.charAt(0)}</Button>
                    </ToggleButton>
                ))}
            </ToggleButtonGroup>
            <Button onClick={() => handleRemove()}>
                <DeleteIcon color='error'/>
            </Button>
        </Grid>
    )
}