
import * as React from 'react';
import {
    styled, Button, Card, CardActions, IconButton, Collapse, Divider,
    Typography, Table, TableRow, TableCell, TableBody
} from '@mui/material';
import {
    Delete, ExpandMore
} from '@mui/icons-material';

import AddTopicDialog from './dialogs/AddTopicDialog';
import DeleteTopicDialog from './dialogs/DeleteTopicDialog';

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

function createData(header, content, markedRead) {
    return { header, content, markedRead };
}
  
const rows = [
    createData('Please pay attention!', 'Please pay attention to when are you helped. We will have to remove you if you\'re not here!', false),
    createData('Browser Notifications', 'Allow browser notifications to get notified of when it\'s your turn to be helped! (See settings for more options)',  false),
    createData('Ask specific questions', 'Please ask a specific question, or else you will be asked to update your question.', false),
    createData('Respecting the Queue', 'We can only answer the question you specified in your entry. If you have a new question, remove your entry and ask a TA to approve skipping the cooldown.', false),
];

// TODO: create AnnouncementDialog that takes in content as a prop with Open Announcement Button
// TODO: add dialogs for delete and a isTA boolean

export default function Announcements(props) {
    const { theme } = props

    const [open, setOpen] = React.useState(false);

    const handleClick = () => {
        setOpen(!open);
    };

    const [openAdd, setOpenAdd] = React.useState(false);
    const [openDelete, setOpenDelete] = React.useState(false);
    const [selectedRow, setSelectedRow] = React.useState();

    const handleAdd = () => {
        setOpenAdd(true);
    };

    const handleDelete = (row) => {
        setOpenDelete(true);
        setSelectedRow(row);
    };

    const handleClose = () => {
        setOpenAdd(false);
        setOpenDelete(false);
    };

    return (
        <div className='card' style={{ display:'flex' }}>
            <Card sx={{ minWidth: '100%' }}>
                <CardActions disableSpacing>
                    <Typography sx={{ fontSize: 16, fontWeight: 'bold', ml: 2, mt: 1 }} variant="h5" gutterBottom>
                        Queue Topic Settings
                    </Typography>
                    <Expand
                        expand={open}
                        onClick={handleClick}
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
                                        {row.name}
                                    </TableCell>
                                    <TableCell align="left" sx={{ fontSize: '16px' }}>{row.dateIn.toLocaleString(DateTime.DATETIME_SHORT)}</TableCell>
                                    <TableCell align="left" sx={{ fontSize: '16px' }}>{row.dateOut.toLocaleString(DateTime.DATETIME_SHORT)}</TableCell>
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
                                    <TableCell align="center" colSpan={4}>
                                        <Button sx={{ mr: 1, fontWeight: 'bold', fontSize: '18px' }} color="primary" variant="contained" onClick={() => handleAdd()}>
                                            + Add Topic
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                </Collapse>
            </Card>
            <AddTopicDialog
                isOpen={openAdd}
                onClose={handleClose}
            />

            <DeleteTopicDialog
                isOpen={openDelete}
                onClose={handleClose}
                topicInfo={selectedRow}
            />
        </div>
    );
}
