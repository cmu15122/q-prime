
import * as React from 'react';
import {
    styled, Button, Card, CardActions, IconButton, Collapse, Divider,
    Typography, Table, TableRow, TableCell, TableBody
} from '@mui/material';
import {
    Help, Delete, ExpandMore
} from '@mui/icons-material';

import AddTopicDialog from '../../admin/dialogs/AddTopicDialog';
import EditTopicDialog from '../../admin/dialogs/EditTopicDialog';
import DeleteTopicDialog from '../../admin/dialogs/DeleteTopicDialog';

import { DateTime } from 'luxon';
import StudentEntry from './StudentEntry';

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


function createData(name, andrewID, topic, question) {
  return { name, andrewID, topic, question};
}

//replace this with getting students form DB later
const students = [
    createData('Student 1', 'stu1', 'Topic 1', 'help'),
    createData('Student 2', 'stu2', 'Topic 1', 'help'),
    createData('Student 3', 'stu3', 'Style Regrade', 'help'),
    createData('Student 4', 'stu4', 'Topic 1', 'testing longer help entry'),
    createData('Student 5', 'stu5', 'Topic 1', 'help'),
];

export default function StudentEntries(props) {
    const { theme } = props

    return (
        <div className='card' style={{ display:'flex' }}>
            <Card sx={{ minWidth: '100%' }}>
                <CardActions disableSpacing>
                    <Typography sx={{ fontSize: 16, fontWeight: 'bold', ml: 2, mt: 1 }} variant="h5" gutterBottom>
                        Students
                    </Typography>
                </CardActions>
                <Divider></Divider>
                    <Table aria-label="topicsTable">
                        <TableBody>
                            {students.map((student, index) => {
                                
                                let studentProps = {
                                ...props,
                                student: student,
                                index: index
                                }

                                return StudentEntry(studentProps);
                                
                                })}
                            
                            {/* don't delete this code, if we want the add student button as a popup this would be nice to have */}
                            {/* <TableRow
                                key='add'
                                style={{ background : theme.palette.background.default }}
                            >
                                <TableCell align="center" colSpan={4}>
                                    <Button sx={{ mr: 1, fontWeight: 'bold', fontSize: '18px' }} color="primary" variant="contained" onClick={() => handleAdd()}>
                                        + Add Student (?)
                                    </Button>
                                </TableCell>
                            </TableRow> */}

                        </TableBody>
                    </Table>
            </Card>
        </div>
    );
}
