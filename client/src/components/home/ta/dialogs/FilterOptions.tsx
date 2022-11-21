import React, {useState, useEffect, useContext} from 'react';

import {List, ListSubheader, ListItem,
  ListItemButton, ListItemIcon, ListItemText, Checkbox,
} from '@mui/material';

import SettingsService from '../../../../services/SettingsService';
import {useQueueDataContext} from '../../../../App';

function createData(topicId, name) {
  return {topicId, name};
}

const date = new Date();

const FilterGroup = {
  Location: Symbol('location'),
  Topic: Symbol('Topic'),
};

export default function FilterOptions(props) {
  const {filteredLocations, filteredTopics, setFilteredLocations, setFilteredTopics} = props;

  const {queueData} = useQueueDataContext();

  // group definition:
  // 0 = locations, 1 = topics
  const handleToggle = (group, value) => () => {
    const array = group === FilterGroup.Location ? filteredLocations : filteredTopics;
    const currentIndex = array.indexOf(value);
    const newChecked = group === FilterGroup.Location ? [...filteredLocations] : [...filteredTopics];

    if (currentIndex === -1) {
      // was unchecked previously
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    if (group === FilterGroup.Location) {
      setFilteredLocations(newChecked);
    } else {
      setFilteredTopics(newChecked);
    }
  };

  const [locations, setLocations] = useState([]);
  const [topics, setTopics] = useState([]);

  useEffect(() => {
    if (queueData != null) {
      updateTopics(queueData.topics);
      updateLocations();
    }
  }, [queueData.topics]);

  function updateTopics(newTopics) {
    const newRows = [];
    newTopics.forEach((topic) => {
      newRows.push(createData(
          topic.assignment_id,
          topic.name,
      ));
    });
    newRows.push(createData(-1, 'Other'));
    setTopics(newRows);
  }

  function updateLocations() {
    const day = date.getDay();
    let newLocations = {};
    SettingsService.getLocations().then((res) => {
      const dayDict = res.data.dayDictionary;
      newLocations = dayDict;

      const roomsForDay = (newLocations && newLocations[day]) ? newLocations[day] : ['Office Hours'];
      setLocations(roomsForDay);
    });
  }

  return (
    <div>
      <List
        sx={{width: '100%', maxWidth: 360, bgcolor: 'background.paper'}}
        component="nav"
        aria-labelledby="nested-list-subheader"
        subheader={
          <ListSubheader component="div" id="nested-list-subheader">
            Locations
          </ListSubheader>
        }
      >
        {locations.map((value) => {
          const labelId = `checkbox-list-label-${value}`;

          return (
            <ListItem
              key={value}
              disablePadding
            >
              <ListItemButton role={undefined} onClick={handleToggle(FilterGroup.Location, value)} dense>
                <ListItemIcon>
                  <Checkbox
                    edge="start"
                    checked={filteredLocations.indexOf(value) !== -1}
                    tabIndex={-1}
                    disableRipple
                    inputProps={{'aria-labelledby': labelId}}
                  />
                </ListItemIcon>
                <ListItemText id={labelId} primary={`${value}`} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <List
        sx={{width: '100%', maxWidth: 360, bgcolor: 'background.paper'}}
        component="nav"
        aria-labelledby="topics-list-subheader"
        subheader={
          <ListSubheader component="div" id="topics-list-subheader">
            Topics
          </ListSubheader>
        }
      >
        {topics.map((value) => {
          const labelId = `checkbox-list-label-${value.name}`;

          return (
            <ListItem
              key={value.id}
              disablePadding
            >
              <ListItemButton role={undefined} onClick={handleToggle(FilterGroup.Topic, value.name)} dense>
                <ListItemIcon>
                  <Checkbox
                    edge="start"
                    checked={filteredTopics.indexOf(value.name) !== -1}
                    tabIndex={-1}
                    disableRipple
                    inputProps={{'aria-labelledby': labelId}}
                  />
                </ListItemIcon>
                <ListItemText id={labelId} primary={`${value.name}`} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </div>
  );
}
