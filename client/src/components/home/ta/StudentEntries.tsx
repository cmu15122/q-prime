import React, { useState, useEffect, useContext, useMemo } from 'react';

import BaseTable from '../../common/table/BaseTable';
import StudentEntry from './StudentEntry';

import FilterOptions from './dialogs/FilterOptions';
import { Button, Popover } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';

import HomeService from '../../../services/HomeService';
import { StudentStatusValues } from '../../../services/StudentStatus';
import { UserDataContext } from '../../../contexts/UserDataContext';
import { AllStudentsContext } from '../../../contexts/AllStudentsContext';
import { socketSubscribeTo } from '../../../services/SocketsService';
import { QueueDataContext } from '../../../contexts/QueueDataContext';

export default function StudentEntries(props) {
  const { setQueueData } = useContext(QueueDataContext);
  const { userData } = useContext(UserDataContext);
  const { allStudents, setAllStudents } = useContext(AllStudentsContext);

  /* BEGIN FILTER LOGIC */

  const [isHelping, setIsHelping] = useState(false);
  useEffect(() => {
    setIsHelping(false);
    for (const student of allStudents) {
      if (
        student.status === StudentStatusValues.BEING_HELPED &&
        student.helpingTAInfo?.taAndrewID === userData.andrewID
      ) {
        setIsHelping(true);
      }
    }
  }, [allStudents, userData.andrewID]);

  const [tempDisabled, setTempDisabled] = useState(false);

  useEffect(() => {
    // only disable for max five seconds
    if (tempDisabled) {
      setTimeout(() => {
        setTempDisabled(false);
      }, 5000);
    }
  }, [tempDisabled, setTempDisabled]);

  const [filteredLocations, setFilteredLocations] = useState([]);
  const [filteredTopics, setFilteredTopics] = useState([]);

  const filteredStudents = useMemo(() => {
    let newFiltered = allStudents;
    if (filteredLocations.length > 0) {
      newFiltered = newFiltered.filter((student) =>
        filteredLocations.includes(student.location),
      );
    }
    if (filteredTopics.length > 0) {
      newFiltered = newFiltered.filter((student) =>
        filteredTopics.includes(student.topic.name),
      );
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
          sx={{ fontWeight: 'bold', mr: 1 }}
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

  useEffect(() => {
    socketSubscribeTo('add', (res) => {
      if (userData.taSettings?.joinNotifsEnabled) {
        new Notification('New Queue Entry', {
          body:
            'Name: ' +
            res.studentData.name +
            '\n' +
            'Andrew ID: ' +
            res.studentData.andrewID +
            '\n' +
            'Topic: ' +
            res.studentData.topic.name,
        });
      }
    });
  }, []);

  const manuallyGetNewData = () => {
    // because people are mainly interacting with the student management buttons,
    // just just just *in case* the websockets don't update (or send update before connection reestablished)
    // we just manually refresh the queue data
    HomeService.getAll().then((res) => {
      setQueueData(res.data);
    });
    HomeService.getAllStudents().then((res) => {
      setAllStudents(res.data.allStudents);
    });
  };

  const handleClickHelp = (index) => {
    setTempDisabled(true);
    HomeService.helpStudent(
        JSON.stringify({
          andrewID: filteredStudents[index].andrewID,
        }),
    )
        .then((res) => {
          if (res.status === 200) {
            manuallyGetNewData();
          }
        })
        .finally(() => {
          setTempDisabled(false);
        });
  };

  const handleCancel = (index) => {
    setTempDisabled(true);
    HomeService.unhelpStudent(
        JSON.stringify({
          andrewID: filteredStudents[index].andrewID,
        }),
    )
        .then((res) => {
          if (res.status === 200) {
            manuallyGetNewData();
          }
        })
        .finally(() => {
          setTempDisabled(false);
        });
  };

  function handleFix(index) {
    setTempDisabled(true);
    HomeService.taRequestUpdateQ(
        JSON.stringify({
          andrewID: filteredStudents[index].andrewID,
        }),
    )
        .then((res) => {
          if (res.status === 200) {
            manuallyGetNewData();
          }
        })
        .finally(() => {
          setTempDisabled(false);
        });
  }

  // used for both removing and done helping
  const removeStudent = (index, doneHelping) => {
    setTempDisabled(true);
    HomeService.removeStudent(
        JSON.stringify({
          andrewID: filteredStudents[index].andrewID,
          doneHelping: doneHelping,
        }),
    )
        .then((res) => {
          if (res.status === 200) {
            manuallyGetNewData();
          }
        })
        .finally(() => {
          setTempDisabled(false);
        });
  };

  const handleClickUnfreeze = (index) => {
    new Error('Unfreeze not implemented');
  };

  /* END QUEUE LOGIC */

  return (
    <BaseTable title="Students" HeaderTailComp={Filter}>
      {filteredStudents.map((student, index) => (
        <StudentEntry
          isHelping={isHelping}
          tempDisabled={tempDisabled}
          key={student.andrewID}
          student={student}
          index={index}
          handleClickHelp={handleClickHelp}
          handleCancel={handleCancel}
          handleFix={handleFix}
          removeStudent={removeStudent}
          handleClickUnfreeze={handleClickUnfreeze}
        />
      ))}
    </BaseTable>
  );
}
