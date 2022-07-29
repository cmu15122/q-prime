
import * as React from 'react';
import {
    Card, CardActions, Divider, Typography, Table, TableBody, Button
} from '@mui/material';

import StudentEntry from './StudentEntry';
import HomeService from '../../../services/HomeService';

export default function StudentEntries(props) {
    const { theme, queueData } = props
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

    // stay helping even on page reload
    React.useEffect(() => {
        for (let [index, student] of students.entries()) {

            if (student['status'] === 0 && student['taAndrewID'] === queueData.andrewID) {
                setHelpIdx(index);
                setIsHelping(true);
            }
        }
    }, [students, queueData])

    const handleClickHelp = (index) => {
        HomeService.helpStudent(JSON.stringify({
            andrewID: students[index]['andrewID']
        })).then(res => {
            if (res.status === 200) {
                setHelpIdx(index);
                setIsHelping(true);
                students[index]['status'] = 0; // Switch student status
            }
        })
    }

    const handleCancel = (index) => {
        HomeService.unhelpStudent(JSON.stringify({
            andrewID: students[index]['andrewID']
        })).then(res => {
            if (res.status === 200) {
                setIsHelping(false);
                setHelpIdx(-1);
                students[index]['status'] = 1;
            }
        })
    }

    const removeStudent = (index) => {
        HomeService.removeStudent(JSON.stringify({
            andrewID: students[index]['andrewID']
        })).then(res => {
            if (res.status === 200) {
                setStudents(students.filter((student, tempIndex) => {
                    return tempIndex !== index
                }))

                setIsHelping(false)
                setHelpIdx(-1)
            }
        })
    }

    const handleClickUnfreeze = (index) => {
        setIsHelping(false);
        setHelpIdx(-1);
        console.log("unfreeeze studenttt");
        console.log(index)
        students[index]['status'] = 1;
    }

    return (
        <div className='card' style={{ display: 'flex' }}>
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
                                removeStudent={removeStudent}
                                handleClickUnfreeze={handleClickUnfreeze}
                            ></StudentEntry>
                        ))}

                    </TableBody>
                </Table>
            </Card>
        </div>
    );
}
