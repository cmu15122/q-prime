import React, { useState } from "react";
import PropTypes from "prop-types";
import {
    styled, Card, CardActions, Collapse, Divider, IconButton, 
    Table, TableBody, Typography, 
} from "@mui/material";

import {
    ExpandMore
} from "@mui/icons-material";

const Expand = styled((props) => {
    const { expand, ...other } = props;
    return <IconButton {...other} />;
})(({ theme, expand }) => ({
    transform: !expand ? "rotate(0deg)" : "rotate(180deg)",
    marginLeft: "auto",
    transition: theme.transitions.create("transform", {
        duration: theme.transitions.duration.shortest,
    })
}));

export default function CollapsedTable(props) {
    const { title, children } = props;
    const [open, setOpen] = useState(false);

    const handleClick = () => {
        setOpen(!open);
    };

    return (
        <div className="card" style={{ display:"flex" }}>
            <Card sx={{ minWidth: "100%" }}>
                <CardActions disableSpacing style={{ cursor: "pointer" }} onClick={handleClick}>
                    <Typography sx={{ fontSize: 16, fontWeight: "bold", ml: 2, mt: 1 }} variant="h5" gutterBottom>
                        {title}
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
                    <Table>
                        <TableBody>
                            {children}
                        </TableBody>
                    </Table>
                </Collapse>
            </Card>
        </div>
    );
}

CollapsedTable.propTypes = {
    children: PropTypes.node
};
