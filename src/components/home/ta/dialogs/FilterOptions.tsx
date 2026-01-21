import { useEffect } from 'react';

import {
  List,
  ListSubheader,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Checkbox,
} from '@mui/material';

const FilterGroup = {
  Location: Symbol('location'),
  Topic: Symbol('Topic'),
};

import { useQuery } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';

export default function FilterOptions(props) {
  const { filteredLocations, filteredTopics, setFilteredLocations, setFilteredTopics } = props;

  const queueData = useQuery(api.home.home_get.getQueueData);
  let locations = queueData?.current_locations || [];

  const currAssignments = useQuery(api.home.home_get.getCurrentAssignments);

  useEffect(() => {
    if (locations.length === 0) {
      locations = ['Office Hours'];
    }
  }, [locations]);

  // group definition:
  // 0 = locations, 1 = topics
  const handleToggle = (group, value) => () => {
    const array = group === FilterGroup.Location ? filteredLocations : filteredTopics;
    const currentIndex = array.indexOf(value);
    const newChecked =
      group === FilterGroup.Location ? [...filteredLocations] : [...filteredTopics];

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

  return (
    <div>
      <List
        sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}
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
            <ListItem key={value} disablePadding>
              <ListItemButton
                role={undefined}
                onClick={handleToggle(FilterGroup.Location, value)}
                dense
              >
                <ListItemIcon>
                  <Checkbox
                    edge="start"
                    checked={filteredLocations.indexOf(value) !== -1}
                    tabIndex={-1}
                    disableRipple
                    inputProps={{ 'aria-labelledby': labelId }}
                  />
                </ListItemIcon>
                <ListItemText id={labelId} primary={`${value}`} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <List
        sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}
        component="nav"
        aria-labelledby="topics-list-subheader"
        subheader={
          <ListSubheader component="div" id="topics-list-subheader">
            Topics
          </ListSubheader>
        }
      >
        {(currAssignments || []).map((topic) => {
          const labelId = `checkbox-list-label-${topic.name}`;

          return (
            <ListItem key={topic.name} disablePadding>
              <ListItemButton
                role={undefined}
                onClick={handleToggle(FilterGroup.Topic, topic.name)}
                dense
              >
                <ListItemIcon>
                  <Checkbox
                    edge="start"
                    checked={filteredTopics.indexOf(topic.name) !== -1}
                    tabIndex={-1}
                    disableRipple
                    inputProps={{ 'aria-labelledby': labelId }}
                  />
                </ListItemIcon>
                <ListItemText id={labelId} primary={`${topic.name}`} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </div>
  );
}
