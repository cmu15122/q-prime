import { useState } from "react";
import PropTypes from "prop-types";
import {
    styled, CardActions, Collapse, Divider, IconButton, 
    Table, TableBody, Typography, 
} from "@mui/material";

import {
    ExpandMore
} from "@mui/icons-material";

import BaseCard from "../cards/BaseCard";

type ExpandProps = {
    expand?: boolean,
    "aria-expanded"?: boolean,
    "aria-label"?: string,
    sx?: any,
    children?: any
};

const Expand = styled((props: ExpandProps) => {
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
        <BaseCard>
            <CardActions disableSpacing style={{ cursor: "pointer" }} onClick={handleClick}>
                <Typography sx={{ fontWeight: "bold", ml: 2, mt: 1 }} variant="body1" gutterBottom>
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
        </BaseCard>
    );
}

CollapsedTable.propTypes = {
    title: PropTypes.string,
    children: PropTypes.node
};
