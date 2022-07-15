import React, { useState, useEffect } from 'react';
import {
    styled, Button, ToggleButton, ToggleButtonGroup
} from '@mui/material';

export default function DayPicker(props) {
    const { room, days, handleDaysChange } = props
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    return (
        <ToggleButtonGroup
            value={days}
            onChange={handleDaysChange(days, room)}
            aria-label="text formatting"
        >
            {daysOfWeek.map((day) => {
                <ToggleButton value={day} aria-label={day}>
                    <Button>{day.charAt(0)}</Button>
                </ToggleButton>
            })}
        </ToggleButtonGroup>
    )
}