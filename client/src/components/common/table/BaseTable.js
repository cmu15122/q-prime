import React from "react";
import PropTypes from "prop-types";
import {
    CardActions, Divider, 
    Table, TableBody, Typography, 
} from "@mui/material";

import BaseCard from "../cards/BaseCard";

export default function BaseTable(props) {
    const { title, children } = props;

    return (
        <BaseCard>
            <CardActions disableSpacing>
                <Typography sx={{ fontWeight: 'bold', ml: 2, mt: 1 }} variant="h5" gutterBottom>
                    {title}
                </Typography>
            </CardActions>
            <Divider></Divider>
            <Table>
                <TableBody>
                    {children}
                </TableBody>
            </Table>
        </BaseCard>
    );
}

BaseTable.propTypes = {
    children: PropTypes.node
};
