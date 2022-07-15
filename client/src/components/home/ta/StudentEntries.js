
import * as React from 'react';
import {
    Card, CardActions, Divider, Typography, Table, TableBody, Button
} from '@mui/material';

import StudentEntry from './StudentEntry';
import HomeService from '../../../services/HomeService';

export default function StudentEntries(props) {
    const { theme } = props
    const [students, setStudents] = React.useState([]);
    const [isHelping, setIsHelping] = React.useState(false);
    const [helpIdx, setHelpIdx] = React.useState(-1); // idx of student that you are helping, only valid when isHelping is true

    React.useEffect(() => {
        const handleGetStudents = () => {
            HomeService.displayStudents().then(res => {
                setStudents(res.data);
            })
        }
        handleGetStudents();
    }, []);

    const handleClickHelp = (index) => {
        setHelpIdx(index);
        setIsHelping(true);
        students[index]['status'] = 0; // Switch student status
    }

    const handleCancel = (index) => {
        setIsHelping(false);
        setHelpIdx(-1);
        students[index]['status'] = 1;
    }

    const handleClickUnfreeze = (index) => {
        setIsHelping(false);
        setHelpIdx(-1);
        console.log("unfreeeze studenttt");
        console.log(index)
        students[index]['status'] = 1;
    }

    const addStudent = (index) => {
        console.log('add student!!');
    }

    return (
        <div className='card' style={{ display:'flex' }}>
            <Card sx={{ minWidth: '100%' }}>
                <CardActions disableSpacing>
                    <Typography sx={{ fontSize: 20, fontWeight: 'bold', ml: 2, mt: 1 }} variant="h5" gutterBottom>
                        Students
                    </Typography>
                </CardActions>
                <Divider></Divider>
                    <Table aria-label="topicsTable">
                        <TableBody>
                            {students.map((student, index) => (
                                <StudentEntry
                                    key={student.andrewID}
                                    theme={theme}
                                    student={student}
                                    index={index}
                                    isHelping={isHelping}
                                    helpIdx={helpIdx}
                                    handleClickHelp={handleClickHelp}
                                    handleCancel={handleCancel}
                                    handleClickUnfreeze={handleClickUnfreeze}
                                    addStudent={addStudent}
                                ></StudentEntry>
                            ))}

                        </TableBody>
                    </Table>
            </Card>
        </div>
    );
}
