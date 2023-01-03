import React, {useState, useEffect, useContext, useMemo} from 'react';

import BaseTable from '../../common/table/BaseTable';
import StudentEntry from './StudentEntry';

import FilterOptions from './dialogs/FilterOptions';
import {Button, Popover} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';

import HomeService from '../../../services/HomeService';
import {socketSubscribeTo, socketUnsubscribeFrom} from '../../../services/SocketsService';
import {StudentStatusValues} from '../../../services/StudentStatus';
import {AllStudentsContext, QueueDataContext, UserDataContext} from '../../../App';

export default function StudentEntries(props) {
  const {queueData} = useContext(QueueDataContext);
  const {userData} = useContext(UserDataContext);
  const {allStudents} = useContext(AllStudentsContext);

  /* BEGIN FILTER LOGIC */
  const [isHelping, setIsHelping] = useState(false);
  const [helpIdx, setHelpIdx] = useState(-1); // idx of student that you are helping, only valid when isHelping is true

  const [filteredLocations, setFilteredLocations] = useState([]);
  const [filteredTopics, setFilteredTopics] = useState([]);

  const filteredStudents = useMemo(() => {
    let newFiltered = allStudents;
    if (filteredLocations.length > 0) {
      newFiltered = newFiltered.filter((student) => filteredLocations.includes(student.location));
    }
    if (filteredTopics.length > 0) {
      newFiltered = newFiltered.filter((student) => filteredTopics.includes(student.topic.name));
    }
    return newFiltered;
  }, [allStudents, filteredLocations, filteredTopics]);

  const Filter = () => {
    const handleFilterDialog = (event) => {
      setAnchorEl(event.currentTarget);
    };

    const [anchorEl, setAnchorEl] = useState(null);
    const handleFilterClose = () => {
      setAnchorEl(null);
    };
    const openFilterDialog = Boolean(anchorEl);

    return (
      <div>
        <Button
          variant="contained"
          startIcon={<FilterListIcon />}
          sx={{fontWeight: 'bold', mr: 1}}
          onClick={handleFilterDialog}
          aria-describedby={'popover'}
        >
          Filter
        </Button>
        <Popover
          id={'popover'}
          open={openFilterDialog}
          anchorEl={anchorEl}
          onClose={handleFilterClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
        >
          <FilterOptions
            filteredLocations={filteredLocations}
            filteredTopics={filteredTopics}
            setFilteredLocations={setFilteredLocations}
            setFilteredTopics={setFilteredTopics}
          />
        </Popover>
      </div>
    );
  };
    /* END FILTER LOGIC (the actual filtering is in QUEUE LOGIC)*/

  /* BEGIN QUEUE LOGIC */

  // function updateStudentFromSockets(res) {
  //   setStudents((students) => {
  //     const ind = students.findIndex((p) => (p.andrewID === res.andrewID));
  //     students[ind] = res.data.studentData;
  //     return [...students];
  //   });
  // }

  // useEffect(() => {
  //   if (!('Notification' in window)) {
  //     console.log('This browser does not support desktop notification');
  //   } else if (Notification.permission !== 'granted') {
  //     Notification.requestPermission();
  //   }

  //   HomeService.displayStudents().then((res) => {
  //     setStudents(res.data);
  //   });

  //   socketSubscribeTo('add', (res) => {
  //     setStudents((students) =>
  //       [...students.filter((p) => p.andrewID !== res.studentData.andrewID), res.studentData],
  //     );

  //     new Notification('New Queue Entry', {
  //       'body': 'Name: ' + res.studentData.name + '\n' +
  //               'Andrew ID: ' + res.studentData.andrewID + '\n' +
  //               'Topic: ' + res.studentData.topic.name,
  //     });
  //   });

  //   socketSubscribeTo('help', updateStudentFromSockets);
  //   socketSubscribeTo('unhelp', updateStudentFromSockets);
  //   socketSubscribeTo('updateQuestion', updateStudentFromSockets);
  //   socketSubscribeTo('updateQRequest', updateStudentFromSockets);
  //   socketSubscribeTo('message', updateStudentFromSockets);
  //   socketSubscribeTo('dismissMessage', updateStudentFromSockets);
  //   socketSubscribeTo('approveCooldown', updateStudentFromSockets);

  //   return () => {
  //     socketUnsubscribeFrom('add');
  //     socketUnsubscribeFrom('help');
  //     socketUnsubscribeFrom('unhelp');
  //     socketUnsubscribeFrom('updateQuestion');
  //     socketUnsubscribeFrom('updateQRequest');
  //     socketUnsubscribeFrom('message');
  //     socketUnsubscribeFrom('dismissMessage');
  //     socketUnsubscribeFrom('approveCooldown');
  //   };
  // }, []);

  // useEffect(() => {
  //   socketSubscribeTo('remove', (res) => {
  //     setStudents((students) =>
  //       [...students.filter((p) => p.andrewID !== res.andrewID)],
  //     );

  //     if (res.studentData.taAndrewID === userData.andrewID) {
  //       setIsHelping(false);
  //       setHelpIdx(-1);
  //     }
  //   });

  //   return () => {
  //     socketUnsubscribeFrom('remove');
  //   };
  // }, [userData.andrewID]);

  useEffect(() => {
    for (const [index, student] of allStudents.entries()) {
      if (student.status === StudentStatusValues.BEING_HELPED && student.taAndrewID === userData.andrewID) {
        setHelpIdx(index);
        setIsHelping(true);
      }
    }
  }, [allStudents, userData.andrewID]);

  // useEffect(() => {
  //   let newFiltered = students;
  //   if (filteredLocations.length > 0) {
  //     newFiltered = newFiltered.filter((student) => filteredLocations.includes(student.location));
  //   }
  //   if (filteredTopics.length > 0) {
  //     newFiltered = newFiltered.filter((student) => filteredTopics.includes(student.topic.name));
  //   }
  //   setFilteredStudents(newFiltered);
  // }, [students, filteredLocations, filteredTopics]);

  const handleClickHelp = (index) => {
    HomeService.helpStudent(JSON.stringify({
      andrewID: allStudents[index].andrewID,
    })).then((res) => {
      if (res.status === 200) {
        setHelpIdx(index);
        setIsHelping(true);
      }
    });
  };

  const handleCancel = (index) => {
    HomeService.unhelpStudent(JSON.stringify({
      andrewID: allStudents[index].andrewID,
    })).then((res) => {
      if (res.status === 200) {
        setHelpIdx(-1);
        setIsHelping(false);
      }
    });
  };

  const removeStudent = (index) => {
    HomeService.removeStudent(JSON.stringify({
      andrewID: allStudents[index].andrewID,
    }));
  };

  const handleClickUnfreeze = (index) => {
    setIsHelping(false);
    setHelpIdx(-1);
    allStudents[index].status = StudentStatusValues.WAITING;
  };

  /* END QUEUE LOGIC */

  return (
    <BaseTable title="Students" HeaderTailComp={Filter}>
      {
        filteredStudents.map((student, index) => (
          <StudentEntry
            key={student.andrewID}
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
