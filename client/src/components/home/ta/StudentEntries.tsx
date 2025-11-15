import React, { useState, useEffect, useMemo } from "react";

import BaseTable from "../../common/table/BaseTable";
import StudentEntry from "./StudentEntry";

import FilterOptions from "./dialogs/FilterOptions";
import { Button, Popover } from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";

export default function StudentEntries() {
  const userData = useQuery(api.home.home_get.getUserData);
  const allStudents = useQuery(api.home.home_get.getAllStudents);

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
        student.status === "being_helped" &&
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
      newFiltered = newFiltered.filter((student) =>
        filteredLocations.includes(student.location),
      );
    }
    if (filteredTopics.length > 0) {
      newFiltered = newFiltered.filter((student) =>
        filteredTopics.includes(student.assignment_id),
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
          sx={{ fontWeight: "bold", mr: 1 }}
          onClick={handleFilterDialog}
          aria-describedby={"popover"}
        >
          Filter
        </Button>
        <Popover
          id={"popover"}
          open={openFilterDialog}
          anchorEl={anchorEl}
          onClose={handleFilterClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
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

  // TODO CONVEX WEBSOCKET NOTIFS
  // useEffect(() => {
  //   socketSubscribeTo("add", (res) => {
  //     if (userData.taSettings?.joinNotifsEnabled) {
  //       new Notification("New Queue Entry", {
  //         body:
  //           "Name: " +
  //           res.studentData.name +
  //           "\n" +
  //           "Andrew ID: " +
  //           res.studentData.andrewID +
  //           "\n" +
  //           "Topic: " +
  //           res.studentData.topic.name,
  //       });
  //     }
  //   });
  // }, []);

  const handleClickHelp = async (index) => {
    setTempDisabled(true);

    await useMutation(api.home.home_mutate.helpStudent)({
      student_id: filteredStudents[index].student_id,
    }).finally(() => {
      setTempDisabled(false);
    });
  };

  const handleCancel = async (index) => {
    setTempDisabled(true);

    await useMutation(api.home.home_mutate.unhelpStudent)({
      student_id: filteredStudents[index].student_id,
    }).finally(() => {
      setTempDisabled(false);
    });
  };

  const handleFix = async (index) => {
    setTempDisabled(true);

    await useMutation(api.home.home_mutate.askToFixQuestion)({
      student_id: filteredStudents[index].student_id,
    }).finally(() => {
      setTempDisabled(false);
    });
  };

  // used for both removing and done helping
  const removeStudent = async (index, doneHelping) => {
    setTempDisabled(true);

    await useMutation(api.home.home_mutate.removeStudent)({
      student_id: filteredStudents[index].student_id,
      reason: doneHelping ? "helped" : "removed",
    }).finally(() => {
      setTempDisabled(false);
    });
  };

  const handleClickUnfreeze = (index) => {
    new Error("Unfreeze not implemented");
  };

  /* END QUEUE LOGIC */

  return (
    <BaseTable title="Students" HeaderTailComp={Filter}>
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
