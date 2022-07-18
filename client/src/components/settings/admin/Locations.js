import React, { useState, useEffect } from 'react';
import {
    styled, Button, Badge, Box, Card, CardActions, IconButton, Collapse, Divider, Stack,
    Typography, Table, TableRow, TableCell, TableBody, ToggleButton, ToggleButtonGroup
} from '@mui/material';
import {
    Edit, Delete, ExpandMore, FindInPage, DataObjectSharp
} from '@mui/icons-material';
import DayPicker from './DayPicker';
import Cookies from 'universal-cookie';
import SettingsService from '../../../services/SettingsService';

const cookies = new Cookies();

const Expand = styled((props) => {
    const { expand, ...other } = props;
    return <IconButton {...other} />;
})(({ theme, expand }) => ({
    transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
    marginLeft: 'auto',
    transition: theme.transitions.create('transform', {
        duration: theme.transitions.duration.shortest,
    })
}));

export default function Locations(props) {
    const { theme, queueData } = props

    const [open, setOpen] = useState(false);

    // TODO: fix string vs int in dictionary so that it properly shows up
    // TODO: figure out why strings are comma concat when swapping/converting
    const handleClick = () => {
        setOpen(!open);
        SettingsService.getLocations().then(res => {
            console.log(res)
            console.log(res.data)
            let dayDict = res.data.dayDictionary
            updateRoomDictionary(dayDict)
        })
        console.log(Object.keys(roomDictionary))
    };
    const [roomDictionary, setRoomDictionary] = useState({}) // dict of location: [days]
    const [dayDictionary, setDayDictionary] = useState({})

    useEffect(() => {
        SettingsService.getLocations().then(res => {
            updateRoomDictionary(res.data.dayDictionary)
        })
    }, []);

    useEffect(() => {
        if (queueData != null) {
            setDayDictionary(queueData.locations)
        }
    }, [queueData]);

    const swapAndGroup = (obj) => {
        return Object.entries(obj).reduce((ret, entry) => {
            const [ key, value ] = entry;
            if (ret[value]) {
                // seen before
                ret[value].push(key)
            } else {
                ret[value] = [key]
            }
            return ret;
          }, {})
    }

    const updateRoomDictionary = (newDayDictionary) => {
        if (!newDayDictionary) return
        console.log(newDayDictionary)
        let newRoomDictionary = swapAndGroup(newDayDictionary)
        console.log(newRoomDictionary)
        setRoomDictionary(newRoomDictionary)
    }

    return (
        <div className='card' style={{ display:'flex' }}>
            <Card sx={{ minWidth: '100%' }}>
                <CardActions disableSpacing style={{ cursor: 'pointer' }} onClick={handleClick}>
                    <Typography sx={{ fontSize: 16, fontWeight: 'bold', ml: 2, mt: 1 }} variant="h5" gutterBottom>
                        Location Settings
                    </Typography>
                    <Expand
                        expand={open}
                        aria-expanded={open}
                        aria-label="show more"
                        sx={{ mr: 1 }}
                    >
                        <ExpandMore />
                    </Expand>
                </CardActions>
                <Collapse in={open} timeout="auto" unmountOnExit>
                    <Divider></Divider>
                        <Table aria-label="topicsTable">
                            <TableBody>
                            {Object.keys(roomDictionary).map((room, index) => (
                                <TableRow
                                    key={room}
                                    style={ index % 2 ? { background : theme.palette.background.paper }:{ background : theme.palette.background.default } }
                                >
                                    <TableCell component="th" scope="row" sx={{ fontSize: '16px', fontWeight: 'bold', pl: 3.25 }}>
                                        {room}
                                    </TableCell>
                                    <TableCell component="th" align='right' sx={{ fontSize: '16px', fontStyle: 'italic', pr: 3.25 }}>
                                        <DayPicker 
                                            room={room}
                                            days={roomDictionary[room]}
                                            roomDictionary={roomDictionary}
                                            setRoomDictionary={setRoomDictionary}
                                            dayDictionary={dayDictionary}
                                            setDayDictionary={setDayDictionary}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                                {/* <TableRow
                                    key='add'
                                    style={{ background : theme.palette.background.default }}
                                >
                                    <TableCell align="center" colSpan={5}>
                                        <Button sx={{ mr: 1, fontWeight: 'bold', fontSize: '18px' }} color="primary" variant="contained" onClick={() => handleAdd()}>
                                            + Add Topic
                                        </Button>
                                    </TableCell>
                                </TableRow> */}
                            </TableBody>
                        </Table>
                </Collapse>
            </Card>
        </div>
    );
}
