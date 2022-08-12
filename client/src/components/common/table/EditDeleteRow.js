import React from "react";
import PropTypes from "prop-types";
import {
    IconButton, TableCell
} from "@mui/material";

import {
    Edit, Delete
} from "@mui/icons-material";

import ItemRow from "./ItemRow";

export default function EditDeleteRow(props) {
    const { theme, index, row, rowKey, children, handleEdit, handleDelete } = props;

    return (
        <ItemRow
            theme={theme}
            index={index}
            rowKey={rowKey}
        >
            {children}
            <TableCell align="right" sx={{ pr: 3 }}>
                <IconButton sx={{ mr: 1 }} color="info" onClick={() => handleEdit(row)}>
                    <Edit />
                </IconButton>

                <IconButton color="error" onClick={() => handleDelete(row)}>
                    <Delete />
                </IconButton>
            </TableCell>
        </ItemRow>
    );
}

EditDeleteRow.propTypes = {
    children: PropTypes.node
};
