
import * as React from 'react';
import {
    Card, CardActions, Divider, Typography, Table, TableBody, Button
} from '@mui/material';

import StudentEntry from './StudentEntry';
import HomeService from '../../../services/HomeService';


function createData(name, andrewID, topic, question, status) {
  return { name, andrewID, topic, question, status};
}

//replace this with getting students form DB later
// const students = [
//     createData('Student 1', 'stu1', 'Topic 1', 'help', 1),
//     createData('Student 2', 'stu2', 'Topic 1', 'help', 2),
//     createData('Student 3', 'stu3', 'Style Regrade', 'help', 0),
//     createData('Student 4', 'stu4', 'Topic 1', `testing longer help entry.  Let's see what happens if we put something really long into here because a student will definitely do it at somepoint so if this broke everything then that would be very sad also i'm a bad person and skipped the cooldown period hehee`, 4),
//     createData('Student 5', 'stu5', 'Topic 1', 'help', 1),
//     createData('Student 6', 'stu6', 'Topic 2', 'dubeg', 3),
//     createData('Student 6', 'stu6', 'Topic 2', 'ya yeeet', 3),
// ];

export default function StudentEntries(props) {
    const { theme } = props
    const [students, setStudents] = React.useState([]);
    const [isHelping, setIsHelping] = React.useState(false);
    const [helpIdx, setHelpIdx] = React.useState(-1); // idx of student that you are helping, only valid when isHelping is true

    React.useEffect(() => {
        handleGetStudents();
    });
    
    const handleGetStudents = () => {
        HomeService.displayStudents().then(res => {
            if(res.status === 200) {
                setStudents(res.data);
                console.log("success", students);
            } else {
                setStudents([]);
                console.log('Error displaying students');
            }
        })
    }

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
            {/* <Button onClick={handleGetStudents}>UPDATE</Button> */}
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
