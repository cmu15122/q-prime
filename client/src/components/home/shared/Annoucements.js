import * as React from 'react';
import {
    styled, Button, Badge, Box, Card, CardActions, IconButton, Collapse, Divider, Stack,
    Typography, Table, TableRow, TableCell, TableBody
} from '@mui/material';
import {
    Edit, Delete, ExpandMore, FindInPage
} from '@mui/icons-material';

import OpenAnnouncement from './dialogs/OpenAnnouncement';
import AddAnnouncement from './dialogs/AddAnnouncement';
import EditAnnouncement from './dialogs/EditAnnouncement';
import DeleteAnnouncement from './dialogs/DeleteAnnouncement';

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

export default function Announcements(props) {
    const { theme, queueData } = props

    const [open, setOpen] = React.useState(false);

    const handleClick = () => {
        setOpen(!open);
    };

    const [openAnnouncement, setOpenAnnouncement] = React.useState(false);
    const [openAdd, setOpenAdd] = React.useState(false);
    const [openEdit, setOpenEdit] = React.useState(false);
    const [openDelete, setOpenDelete] = React.useState(false);
    const [selectedRow, setSelectedRow] = React.useState();

    const [newHeader, setQuestionHeader] = React.useState('')
    const [newContent, setQuestionContent] = React.useState('')

    const handleOpenAnnouncement = (row) => {
        setOpenAnnouncement(true);
        setSelectedRow(row);
    }

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
        setOpenAnnouncement(false);
        setOpenAdd(false);
        setOpenEdit(false);
        setOpenDelete(false);
    };

    const handleMarkRead = () => {
        selectedRow['markedRead'] = true;
        console.log(selectedRow.markedRead);
        setOpenAnnouncement(false);
    };

    const handleSave = () => {
        selectedRow['header'] = newHeader == '' ? selectedRow?.header : newHeader;
        selectedRow['content'] = newContent == '' ? selectedRow?.content : newContent;
        selectedRow['markedRead'] = false;
        setOpenEdit(false);
    }

    return (
        <div className='card' style={{ display:'flex' }}>
            <Card sx={{ minWidth: '100%' }}>
                <CardActions disableSpacing onClick={handleClick} style={{ cursor: 'pointer' }}>
                    <Typography sx={{ fontSize: 16, fontWeight: 'bold', ml: 2, mt: 1 }} variant="h5" gutterBottom>
                        Announcements
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
                        <Table aria-label="topicsTxable">
                            <TableBody>
                            {rows.map((row, index) => (
                                <TableRow
                                    key={row.header}
                                    style={ index % 2 ? { background : theme?.palette?.background.paper }:{ background : theme?.palette?.background.default }}
                                >
                                    <TableCell component="th" scope="row" sx={{ fontSize: '16px', fontWeight: 'bold', pl: 3.25 }}>
                                        {row.header}
                                    </TableCell>
                                    <Stack sx={{ mr: 2 }}direction='row' margin='auto' justifyContent='flex-end'>
                                        {row.markedRead
                                         ?
                                            <IconButton color="primary" variant='contained' sx={{ mr: 1 }} onClick={() => handleOpenAnnouncement(row)}>
                                                <FindInPage />
                                            </IconButton>
                                         : 
                                            <IconButton color="primary" variant='contained' sx={{ mr: 1 }} onClick={() => handleOpenAnnouncement(row)}>
                                                <Badge badgeContent="new" color="success" anchorOrigin={{ vertical: 'top', horizontal: 'left' }} overlap="rectangular" variant='standard'>
                                                    <FindInPage />
                                                </Badge>
                                            </IconButton>
                                        }
                                        {
                                            queueData?.isTA && 
                                            <Box>
                                                <IconButton sx={{ mr: 1 }} color="info" onClick={() => handleEdit(row)}>
                                                    <Edit />
                                                </IconButton>

                                                <IconButton color="error" onClick={() => handleDelete(row)}>
                                                    <Delete />
                                                </IconButton>
                                            </Box>
                                        }
                                    </Stack>
                                </TableRow>
                            ))}
                            {
                                queueData?.isTA &&
                                <TableRow
                                    key='add'
                                    style={{ background : theme?.palette?.background.default }}
                                >
                                    <TableCell align="center" colSpan={4}>
                                        <Button sx={{ mr: 1, fontWeight: 'bold', fontSize: '18px' }} color="primary" variant="contained" onClick={() => handleAdd()}>
                                            + Create
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            }
                            </TableBody>
                        </Table>
                </Collapse>
            </Card>
            
            <OpenAnnouncement 
                isOpen={openAnnouncement}
                announcementInfo={selectedRow}
                onClose={handleClose}
                onMarkRead={handleMarkRead}
            />

            <AddAnnouncement
                isOpen={openAdd}
                onClose={handleClose}
            />

            <EditAnnouncement
                isOpen={openEdit}
                onClose={handleClose}
                announcementInfo={selectedRow}
                onSave={handleSave}
                setHeader={setQuestionHeader}
                setContent={setQuestionContent}
            />

            <DeleteAnnouncement
                isOpen={openDelete}
                onClose={handleClose}
                announcementInfo={selectedRow}
            />
        </div>
    );
}
