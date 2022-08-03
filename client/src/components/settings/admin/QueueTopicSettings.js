import React, { useState, useEffect } from "react";
import {
    TableCell
} from "@mui/material";

import TopicDialogBody from "./dialogs/TopicDialogBody";

import AddDialog from "../../common/dialogs/AddDialog";
import EditDialog from "../../common/dialogs/EditDialog";
import DeleteDialog from "../../common/dialogs/DeleteDialog";

import AddRow from "../../common/table/AddRow";
import CollapsedTable from "../../common/table/CollapsedTable";
import EditDeleteRow from "../../common/table/EditDeleteRow";

import SettingsService from "../../../services/SettingsService";

import { DateTime } from "luxon";

function createData(assignment_id, name, category, startDate, endDate) {
    startDate = DateTime.fromISO(startDate);
    endDate = DateTime.fromISO(endDate);
    return { assignment_id, name, category, startDate, endDate };
}

export default function QueueTopicSettings(props) {
    const { theme, queueData } = props

    const [selectedRow, setSelectedRow] = useState();
    const [rows, setRows] = useState([]);

    useEffect(() => {
        if (queueData != null) {
            updateTopics(queueData.topics);
        }
    }, [queueData]);

    const updateTopics = (newTopics) => {
        let newRows = [];
        newTopics.forEach (topic => {
            newRows.push(createData(
                topic.assignment_id, 
                topic.name, 
                topic.category, 
                topic.start_date, 
                topic.end_date
            ));
        });
        setRows(newRows);
    };

    /** Dialog Functions */
    const [name, setName] = useState("");
    const [category, setCategory] = useState("");
    const [startDate, setStartDate] = useState(DateTime.now());
    const [endDate, setEndDate] = useState(DateTime.now());

    const [openAdd, setOpenAdd] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);

    const handleAddDialog = () => {
        setOpenAdd(true);

        setName("");
        setCategory("");
        setStartDate(DateTime.now());
        setEndDate(DateTime.now());
    };

    const handleEditDialog = (row) => {
        setOpenEdit(true);
        setSelectedRow(row);

        setName(row.name);
        setCategory(row.category);
        setStartDate(row.startDate);
        setEndDate(row.endDate);
    };

    const handleDeleteDialog = (row) => {
        setOpenDelete(true);
        setSelectedRow(row);
    };

    const handleClose = () => {
        setOpenAdd(false);
        setOpenEdit(false);
        setOpenDelete(false);
    };

    const updateStartDate = (newStartDate) => {
        setStartDate(newStartDate);
        if (newStartDate > endDate) {
            setEndDate(newStartDate);
        }
    };

    const handleAdd = event => {
        event.preventDefault();
        SettingsService.createTopic(
            JSON.stringify({
                name: name,
                category: category,
                start_date: startDate.toString(),
                end_date: endDate.toString()
            })
        ).then(res => {
            updateTopics(res.data.topics);
            handleClose();
        });
    };

    const handleEdit = event => {
        event.preventDefault();
        SettingsService.updateTopic(
            JSON.stringify({
                assignment_id: selectedRow?.assignment_id,
                name: name,
                category: category,
                start_date: startDate.toString(),
                end_date: endDate.toString()
            })
        ).then(res => {
            updateTopics(res.data.topics);
            handleClose();
        });
    };

    const handleDelete = () => {
        SettingsService.deleteTopic(
            JSON.stringify({
                assignment_id: selectedRow?.assignment_id
            })
        ).then(res => {
            updateTopics(res.data.topics);
            handleClose();
        });
    };

    return (
        <div>
            <CollapsedTable 
                theme={theme}
                title="Queue Topic Settings"
            >
                {
                    rows.map((row, index) => (
                        <EditDeleteRow
                            theme={theme}
                            index={index}
                            row={row}
                            rowKey={row.name} 
                            handleEdit={handleEditDialog} 
                            handleDelete={handleDeleteDialog}
                        >
                            <TableCell component="th" scope="row" sx={{ fontSize: "16px", fontWeight: "bold", pl: 3.25 }}>
                                {row.name}
                            </TableCell>
                            <TableCell component="th" scope="row" sx={{ fontSize: "16px", fontStyle: "italic", pl: 3.25 }}>
                                {row.category}
                            </TableCell>
                            <TableCell align="left" sx={{ fontSize: "16px" }}>{row.startDate.toLocaleString(DateTime.DATETIME_SHORT)}</TableCell>
                            <TableCell align="left" sx={{ fontSize: "16px" }}>{row.endDate.toLocaleString(DateTime.DATETIME_SHORT)}</TableCell>
                        </EditDeleteRow>
                    ))
                }
                <AddRow
                    theme={theme}
                    addButtonLabel="+ Add Topic"
                    handleAdd={handleAddDialog}
                />
            </CollapsedTable>

            <AddDialog
                title="Add New Topic"
                isOpen={openAdd}
                onClose={handleClose}
                handleCreate={handleAdd}
            >
                <TopicDialogBody
                    name={name}
                    setName={setName}
                    category={category}
                    setCategory={setCategory}
                    startDate={startDate}
                    setStartDate={updateStartDate}
                    endDate={endDate}
                    setEndDate={setEndDate}
                />
            </AddDialog>

            <EditDialog
                title={"Edit Topic Info"}
                isOpen={openEdit}
                onClose={handleClose}
                handleEdit={handleEdit}
            >
                <TopicDialogBody
                    name={name}
                    setName={setName}
                    category={category}
                    setCategory={setCategory}
                    startDate={startDate}
                    setStartDate={updateStartDate}
                    endDate={endDate}
                    setEndDate={setEndDate}
                />
            </EditDialog>

            <DeleteDialog
                title="Delete Topic"
                isOpen={openDelete}
                onClose={handleClose}
                handleDelete={handleDelete}
                itemName={" " + selectedRow?.name}
            />
        </div>
    );
}
