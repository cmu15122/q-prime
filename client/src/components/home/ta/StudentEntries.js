import React, { useState, useEffect } from 'react';

import BaseTable from '../../common/table/BaseTable';
import StudentEntry from './StudentEntry';

import HomeService from '../../../services/HomeService';
import { socketSubscribeTo } from '../../../services/SocketsService';

export default function StudentEntries(props) {
    const { theme, queueData } = props;
    const [students, setStudents] = useState([]);
    const [isHelping, setIsHelping] = useState(false);
    const [helpIdx, setHelpIdx] = useState(-1); // idx of student that you are helping, only valid when isHelping is true

    const handleGetStudents = () => {
        HomeService.displayStudents().then(res => {
            setStudents(res.data);
        })
    };

    useEffect(() => {
        if (!("Notification" in window)) {
            console.log("This browser does not support desktop notification");
        } else {
            Notification.requestPermission();
        }

        handleGetStudents();

        socketSubscribeTo("help", (res) => {
            setStudents(students => 
                [...students.filter(p => p.andrewID !== res.andrewID), res.data.studentData]
            );
        });

        socketSubscribeTo("unhelp", (res) => {
            setStudents(students => 
                [...students.filter(p => p.andrewID !== res.andrewID), res.data.studentData]
            );

            if (res.data.taData.taAndrewID === queueData.andrewID) {
                setIsHelping(false);
            }
        });

        socketSubscribeTo("add", (res) => {
            setStudents(students => 
                [...students.filter(p => p.andrewID !== res.studentData.andrewID), res.studentData]
            );
            new Notification("New Queue Entry", {
                "body": "Name: " + res.studentData.name + "\n" +
                        "Andrew ID: " + res.studentData.andrewID + "\n" +
                        "Topic: " + res.studentData.topic
            });
        });

        socketSubscribeTo("remove", (res) => {
            setStudents(students => 
                [...students.filter(p => p.andrewID !== res.andrewID)]
            );
        });
    }, []);

    // stay helping even on page reload
    useEffect(() => {
        for (let [index, student] of students.entries()) {
            if (student['status'] === 0 && student['taAndrewID'] === queueData.andrewID) {
                setHelpIdx(index);
                setIsHelping(true);
            }
        }
    }, [students, queueData]);

    const handleClickHelp = (index) => {
        HomeService.helpStudent(JSON.stringify({
            andrewID: students[index]['andrewID']
        })).then(res => {
            if (res.status === 200) {
                setHelpIdx(index);
                setIsHelping(true);
                students[index]['status'] = 0; // Switch student status
            }
        });
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
        });
    }

    const removeStudent = (index) => {
        HomeService.removeStudent(JSON.stringify({
            andrewID: students[index]['andrewID']
        })).then(res => {
            if (res.status === 200) {
                setStudents(students.filter((student, tempIndex) => {
                    return tempIndex !== index;
                }));
                setIsHelping(false);
                setHelpIdx(-1);
            }
        });
    }

    const handleClickUnfreeze = (index) => {
        setIsHelping(false);
        setHelpIdx(-1);
        console.log("unfreeeze student");
        console.log(index);
        students[index]['status'] = 1;
    }

    return (
        <BaseTable title="Students">
            {
                students.map((student, index) => (
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
                    />
                ))
            }
        </BaseTable>
    );
}
