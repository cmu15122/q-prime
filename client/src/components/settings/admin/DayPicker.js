import React, { useState, useEffect } from 'react';
import {
    styled, Button, ToggleButton, ToggleButtonGroup
} from '@mui/material';

const _ = require("underscore")

export default function DayPicker(props) {
    const { room, roomDictionary, setDayDictionary, swapAndGroup } = props
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const [newDays, setNewDays] = useState(roomDictionary[room])
    const handleDayClick = (event, newArr) => {
        console.log(newArr)
        setNewDays(newArr)
        roomDictionary[room] = newArr
        console.log(roomDictionary)
        let newDayDictionary = swapAndGroup(roomDictionary)
        setDayDictionary(newDayDictionary)
    }
    return (
        <ToggleButtonGroup
            value={newDays}
            onChange={handleDayClick}
            aria-label="text formatting"
            size='small'
        >
            {daysOfWeek.map((day) => (
                <ToggleButton value={day} key={day} aria-label={day} size='small' sx={{m: 0, p: 0}}>
                    <Button size='small' variant={newDays.includes(day) ? 'contained' : 'outlined'} sx={{m: 0, pl: 0, pr: 0}} value={day}>{day.charAt(0)}</Button>
                </ToggleButton>
            ))}
        </ToggleButtonGroup>
    )
}