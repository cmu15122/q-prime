import React from "react";
import PropTypes from "prop-types";
import {
    Card, CardActions, Divider, 
    Table, TableBody, Typography, 
} from "@mui/material";

export default function BaseTable(props) {
    const { title, children } = props;

    return (
        <div className='card' style={{ display: 'flex' }}>
            <Card sx={{ minWidth: '100%' }}>
                <CardActions disableSpacing>
                    <Typography sx={{ fontSize: 20, fontWeight: 'bold', ml: 2, mt: 1 }} variant="h5" gutterBottom>
                        {title}
                    </Typography>
                </CardActions>
                <Divider></Divider>
                <Table>
                    <TableBody>
                        {children}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
}

BaseTable.propTypes = {
    children: PropTypes.node
};
