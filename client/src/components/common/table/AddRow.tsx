import React from "react";
import {
    Button, TableCell, TableRow, useTheme
} from "@mui/material";

export default function AddRow(props) {
    const { addButtonLabel, handleAdd } = props;
    const theme = useTheme();

    return (
        <TableRow
            key="add"
            style={{ background : theme.palette.background.default }}
        >
            <TableCell align="center" colSpan={5}>
                <Button sx={{ mr: 1, fontWeight: "bold" }} color="primary" variant="contained" onClick={() => handleAdd()}>
                    {addButtonLabel}
                </Button>
            </TableCell>
        </TableRow>
    );
}
