import React, { useState, useEffect } from "react";
import {
    Checkbox, FormControlLabel, Grid, TableCell
} from "@mui/material";

import TADialogBody from "./dialogs/TADialogBody";

import AddDialog from "../../common/dialogs/AddDialog";
import EditDialog from "../../common/dialogs/EditDialog";
import DeleteDialog from "../../common/dialogs/DeleteDialog";

import CollapsedTable from "../../common/table/CollapsedTable";
import EditDeleteRow from "../../common/table/EditDeleteRow";
import AddRow from "../../common/table/AddRow";

import SettingsService from "../../../services/SettingsService";

function createData(user_id, name, email, isAdmin) {
    return { user_id, name, email, isAdmin };
}

export default function TASettings(props) {
    const { theme, queueData } = props;

    const [selectedRow, setSelectedRow] = useState();
    const [rows, setRows] = useState([]);

    useEffect(() => {
        if (queueData != null) {
            updateTAs(queueData.tas);
        }
    }, [queueData]);

    const updateTAs = (newTAs) => {
        let newRows = [];
        newTAs.forEach (ta => {
            newRows.push(createData(
                ta.ta_id,
                ta.preferred_name,
                ta.email,
                ta.isAdmin
            ));
        });
        setRows(newRows);
    };

    /** Dialog Functions */
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [isAdmin, setIsAdmin] = useState(false);

    const [openAdd, setOpenAdd] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);

    const handleAddDialog = () => {
        setOpenAdd(true);

        setName("");
        setEmail("");
        setIsAdmin(false);
    };

    const handleEditDialog = (row) => {
        setOpenEdit(true);
        setSelectedRow(row);

        setName(row.name);
        setEmail(row.email);
        setIsAdmin(row.isAdmin);
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

    const handleAdd = event => {
        event.preventDefault();
        SettingsService.createTA(
            JSON.stringify({
                name: name,
                email: email,
                isAdmin: isAdmin
            })
        ).then(res => {
            updateTAs(res.data.tas);
            handleClose();
        });
    };

    const handleEdit = event => {
        event.preventDefault();
        SettingsService.updateTA(
            JSON.stringify({
                user_id: selectedRow.user_id,
                isAdmin: isAdmin
            })
        ).then(res => {
            updateTAs(res.data.tas);
            handleClose();
        });
    };

    const handleDelete = () => {
        SettingsService.deleteTA(
            JSON.stringify({
                user_id: selectedRow.user_id
            })
        ).then(res => {
            updateTAs(res.data.tas);
            handleClose();
        });
    };

    return (
        <div>
            <CollapsedTable 
                theme={theme}
                title="TA Settings"
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
                                {row.name} {row.isAdmin ? " (Admin)" : ""}
                            </TableCell>
                            <TableCell align="left" sx={{ fontSize: "16px", fontStyle: "italic" }}>
                                {row.email}
                            </TableCell>
                        </EditDeleteRow>
                    ))
                }
                <AddRow
                    theme={theme}
                    addButtonLabel="+ Add TA"
                    handleAdd={handleAddDialog}
                />
            </CollapsedTable>

            <AddDialog
                title="Add New TA"
                isOpen={openAdd}
                onClose={handleClose}
                handleCreate={handleAdd}
            >
                <TADialogBody
                    name={name}
                    setName={setName}
                    isAdmin={isAdmin}
                    setIsAdmin={setIsAdmin}
                    email={email}
                    setEmail={setEmail}
                />
            </AddDialog>

            <EditDialog
                title={"Edit Info for TA \""+name+"\""}
                isOpen={openEdit}
                onClose={handleClose}
                handleEdit={handleEdit}
            >
                <Grid container spacing={3}>
                    <Grid className="d-flex" align="center" item xs={12}>
                        <FormControlLabel 
                            label="Is Admin?" 
                            labelPlacement="start" 
                            sx={{ pt: 1 }} 
                            control={
                                <Checkbox
                                    checked={isAdmin}
                                    onChange={(e) => setIsAdmin(e.target.checked)}
                                />
                            }
                        />
                    </Grid>
                </Grid>
            </EditDialog>

            <DeleteDialog
                title="Delete TA"
                isOpen={openDelete}
                onClose={handleClose}
                handleDelete={handleDelete}
                itemName={" " + selectedRow?.name}
            />
        </div>
    );
}
