import React from "react";
import PropTypes from "prop-types";
import {
    TableRow
} from "@mui/material";

export default function ItemRow(props) {
    const { theme, index, rowKey, children } = props;

    return (
        <TableRow
            key={rowKey}
            style={ index % 2 ? { background : theme.palette.background.paper }:{ background : theme.palette.background.default }}
        >
            {children}
        </TableRow>
    );
}

ItemRow.propTypes = {
    children: PropTypes.node
};
