
import React, { useState, useEffect } from 'react';
import {
    styled, Button, Card, CardActions, IconButton, Collapse, Divider,
    Typography, Table, TableRow, TableCell, TableBody
} from '@mui/material'
import {
    Edit, Delete, ExpandMore
} from '@mui/icons-material'

import AddTADialog from './dialogs/AddTADialog';
import EditTADialog from './dialogs/EditTADialog';
import DeleteTADialog from './dialogs/DeleteTADialog';

const Expand = styled((props) => {
        const { expand, ...other } = props;
        return <IconButton {...other} />;
    })(({ theme, expand }) => ({
        transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
        marginLeft: 'auto',
        transition: theme.transitions.create('transform', {
        duration: theme.transitions.duration.shortest,
    }),
}));

function createData(user_id, name, email, isAdmin) {
    return { user_id, name, email, isAdmin };
}
  
// const rows = [
//     createData('Angela Zhang', 'angelaz1@andrew.cmu.edu', false),
//     createData('Amanda Li', 'xal@andrew.cmu.edu', true),
//     createData('Lora Zhou', 'lbzhou@andrew.cmu.edu', true),
// ];

export default function TASettings(props) {
    const { theme, queueData } = props

    const [open, setOpen] = React.useState(false);

    const handleClick = () => {
        setOpen(!open);
    };

    const [openAdd, setOpenAdd] = React.useState(false);
    const [openEdit, setOpenEdit] = React.useState(false);
    const [openDelete, setOpenDelete] = React.useState(false);
    const [selectedRow, setSelectedRow] = React.useState();
    const [rows, setRows] = useState([]);

    useEffect(() => {
        if (queueData != null) {
            updateTAs(queueData.tas);
        }
    }, [queueData]);

    const handleAdd = () => {
        setOpenAdd(true);
    };

    const handleEdit = (row) => {
        setOpenEdit(true);
        setSelectedRow(row);
    };

    const handleDelete = (row) => {
        setOpenDelete(true);
        setSelectedRow(row);
    };

    const handleClose = () => {
        setOpenAdd(false);
        setOpenEdit(false);
        setOpenDelete(false);
    };

    const updateTAs = (newTAs) => {
        let newRows = [];
        newTAs.forEach (ta => {
            newRows.push(createData(
                ta.ta_id,
                (ta.preferred_name ? ta.preferred_name : ta.name),
                ta.email,
                ta.isAdmin
            ));
        });
        setRows(newRows);
    }

    return (
        <div className='card' style={{ display:'flex' }}>
            <Card sx={{ minWidth: '100%' }}>
                <CardActions disableSpacing style={{ cursor: 'pointer' }} onClick={handleClick}>
                    <Typography sx={{ fontSize: 16, fontWeight: 'bold', ml: 2, mt: 1 }} variant="h5" gutterBottom>
                        TA Settings
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
                            {rows.map((row, index) => (
                                <TableRow
                                    key={row.name}
                                    style={ index % 2 ? { background : theme.palette.background.paper }:{ background : theme.palette.background.default }}
                                >
                                    <TableCell component="th" scope="row" sx={{ fontSize: '16px', fontWeight: 'bold', pl: 3.25 }}>
                                        {row.name} {row.isAdmin ? " (Admin)" : ""}
                                    </TableCell>
                                    <TableCell align="left" sx={{ fontSize: '16px', fontStyle: 'italic' }}>{row.email}</TableCell>
                                    <TableCell align="right" sx={{ pr: 3 }}>
                                        <IconButton sx={{ mr: 1 }} color="info" onClick={() => handleEdit(row)}>
                                            <Edit />
                                        </IconButton>

                                        <IconButton color="error" onClick={() => handleDelete(row)}>
                                            <Delete />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                                <TableRow
                                    key='add'
                                    style={{ background : theme.palette.background.default }}
                                >
                                    <TableCell align="center" colSpan={3}>
                                        <Button sx={{ mr: 1, fontWeight: 'bold', fontSize: '18px' }} color="primary" variant="contained" onClick={() => handleAdd()}>
                                            + Add TA
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                </Collapse>
            </Card>

            <AddTADialog
                isOpen={openAdd}
                onClose={handleClose}
                updateTAs={updateTAs}
            />

            <EditTADialog
                isOpen={openEdit}
                onClose={handleClose}
                taInfo={selectedRow}
                updateTAs={updateTAs}
            />

            <DeleteTADialog
                isOpen={openDelete}
                onClose={handleClose}
                taInfo={selectedRow}
                updateTAs={updateTAs}
            />
        </div>
    );
}
