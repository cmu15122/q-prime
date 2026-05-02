import { useState, useEffect, useMemo } from 'react';

import BaseTable from '../../common/table/BaseTable';
import StudentEntry from './StudentEntry';

import FilterOptions from './dialogs/FilterOptions';
import { Button, Popover } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';

import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { useCourseId } from '../../../contexts/CourseContext';

const Filter = ({ filteredLocations, filteredTopics, setFilteredLocations, setFilteredTopics }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleFilterDialog = (event) => {
    setAnchorEl(event.currentTarget);
  };

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

export default function StudentEntries() {
  const courseId = useCourseId();
  const userData = useQuery(api.home.home_get.getUserData, { courseId });
  const allStudents = useQuery(api.home.home_get.getAllStudents, { courseId });

  // Add a current time state that will be passed to all StudentStatus components
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Update the current time every second
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  /* BEGIN FILTER LOGIC */

  const [isHelping, setIsHelping] = useState(false);
  useEffect(() => {
    if (!allStudents || !userData?.user_id) {
      return;
    }
    setIsHelping(false);
    for (const student of allStudents) {
      if (
        student.status === 'being_helped' &&
        student.helping_ta!.ta_id === userData.ta_data!.ta_id
      ) {
        setIsHelping(true);
      }
    }
  }, [allStudents, userData?.user_id]);

  const [tempDisabled, setTempDisabled] = useState(false);

  useEffect(() => {
    // only disable for max five seconds
    if (tempDisabled) {
      setTimeout(() => {
        setTempDisabled(false);
      }, 5000);
    }
  }, [tempDisabled, setTempDisabled]);

  const [filteredLocations, setFilteredLocations] = useState<any[]>([]);
  const [filteredTopics, setFilteredTopics] = useState<any[]>([]);

  const filteredStudents = useMemo(() => {
    if (!allStudents) {
      return [];
    }

    let newFiltered = allStudents;
    if (filteredLocations.length > 0) {
      newFiltered = newFiltered.filter((student) => filteredLocations.includes(student.location));
    }
    if (filteredTopics.length > 0) {
      newFiltered = newFiltered.filter((student) => filteredTopics.includes(student.assignment_id));
    }
    return newFiltered;
  }, [allStudents, filteredLocations, filteredTopics]);

  const FilterWithProps = useMemo(() => {
    return (props) => (
      <Filter
        filteredLocations={filteredLocations}
        filteredTopics={filteredTopics}
        setFilteredLocations={setFilteredLocations}
        setFilteredTopics={setFilteredTopics}
        {...props}
      />
    );
  }, [filteredLocations, filteredTopics, setFilteredLocations, setFilteredTopics]);
  /* END FILTER LOGIC (the actual filtering is in QUEUE LOGIC)*/

  /* BEGIN QUEUE LOGIC */

  const helpStudentMutation = useMutation(api.home.home_mutate.helpStudent);
  const unhelpStudentMutation = useMutation(api.home.home_mutate.unhelpStudent);
  const askToFixQuestionMutation = useMutation(api.home.home_mutate.askToFixQuestion);
  const removeStudentMutation = useMutation(api.home.home_mutate.removeStudent);

  const handleClickHelp = async (index) => {
    setTempDisabled(true);

    await helpStudentMutation({
      courseId,
      student_id: filteredStudents[index].student_id,
    }).finally(() => {
      setTempDisabled(false);
    });
  };

  const handleCancel = async (index) => {
    setTempDisabled(true);

    await unhelpStudentMutation({
      courseId,
      student_id: filteredStudents[index].student_id,
    }).finally(() => {
      setTempDisabled(false);
    });
  };

  const handleFix = async (index) => {
    setTempDisabled(true);

    await askToFixQuestionMutation({
      courseId,
      student_id: filteredStudents[index].student_id,
    }).finally(() => {
      setTempDisabled(false);
    });
  };

  // used for both removing and done helping
  const removeStudent = async (index, doneHelping) => {
    setTempDisabled(true);

    await removeStudentMutation({
      courseId,
      student_id: filteredStudents[index].student_id,
      reason: doneHelping ? 'helped' : 'removed',
    }).finally(() => {
      setTempDisabled(false);
    });
  };

  const handleClickUnfreeze = (_index) => {
    new Error('Unfreeze not implemented');
  };

  /* END QUEUE LOGIC */

  return (
    <BaseTable title="Students" HeaderTailComp={FilterWithProps}>
      {filteredStudents.map((student, index) => (
        <StudentEntry
          isHelping={isHelping}
          tempDisabled={tempDisabled}
          key={student.student_id}
          student={student}
          index={index}
          handleClickHelp={handleClickHelp}
          handleCancel={handleCancel}
          handleFix={handleFix}
          removeStudent={removeStudent}
          handleClickUnfreeze={handleClickUnfreeze}
          currentTime={currentTime}
        />
      ))}
    </BaseTable>
  );
}
