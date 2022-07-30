import React, { useState, useEffect } from "react";
import {
    TableCell
} from "@mui/material";

import DayPicker from "./DayPicker";

import AddDialog from "../../common/dialogs/AddDialog";
import LocationDialogBody from "./dialogs/LocationDialogBody";

import AddRow from "../../common/table/AddRow";
import CollapsedTable from "../../common/table/CollapsedTable";

import SettingsService from "../../../services/SettingsService";
import ItemRow from "../../common/table/ItemRow";

export default function Locations(props) {
    const { theme, queueData } = props;

    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    
    const [roomDictionary, setRoomDictionary] = useState({}); // dict of location: [days]
    const [dayDictionary, setDayDictionary] = useState({});
    
    useEffect(() => {
        SettingsService.getLocations()
            .then(res => {
                updateRoomDictionary(res.data.roomDictionary);
            });
    }, []);
    
    useEffect(() => {
        if (queueData != null) {
            setDayDictionary(queueData.locations);
        }
    }, [queueData]);
    
    const updateRoomDictionary = (newRoomDict) => {
        if (!newRoomDict) return;
        setRoomDictionary(newRoomDict);
    }
    
    const convertIdxToDays = (idxArr) => {
        return idxArr.map((idx) => daysOfWeek[idx]);
    }
    
    /** Add Dialog Functions */
    const [openAdd, setOpenAdd] = useState(false);
    const [room, setRoom] = useState("");

    const handleAdd = () => {
        setOpenAdd(true);
    };

    const handleClose = () => {
        setOpenAdd(false);
    };

    const handleCreate = () => {
        SettingsService.addLocation(
            JSON.stringify({
                room: room,
            })
        ).then(res => {
            handleClose();
            setRoomDictionary(res.data.roomDictionary);
        });
    };

    return (
        <div>
            <CollapsedTable
                theme={theme}
                title="Location Settings"
            >
                {
                    Object.keys(roomDictionary).map((room, index) => (
                        <ItemRow
                            theme={theme}
                            index={index}
                            rowKey={room}
                        >
                            <TableCell component="th" scope="row" sx={{ fontSize: "16px", fontWeight: "bold", pl: 3.25 }}>
                                {room}
                            </TableCell>
                            <TableCell component="th" align="right" sx={{ fontSize: "16px", fontStyle: "italic", pr: 3.25 }}>
                                <DayPicker
                                    convertIdxToDays={convertIdxToDays}
                                    room={room}
                                    days={roomDictionary[room]}
                                    daysOfWeek={daysOfWeek}
                                    roomDictionary={roomDictionary}
                                    setRoomDictionary={setRoomDictionary}
                                    dayDictionary={dayDictionary}
                                    setDayDictionary={setDayDictionary}
                                />
                            </TableCell>
                        </ItemRow>
                    ))
                }
                <AddRow
                    theme={theme}
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
