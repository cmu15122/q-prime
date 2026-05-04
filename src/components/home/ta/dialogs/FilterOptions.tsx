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

import type { SxProps, Theme } from '@mui/material/styles';
import { useQuery } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import { useCourseId } from '../../../../contexts/CourseContext';

const subheaderSx: SxProps<Theme> = (theme) => ({
  fontFamily: theme.fonts.ui,
  fontWeight: 700,
  fontSize: 13,
  color: theme.palette.ink.primary,
  backgroundColor: theme.palette.paper[1],
  lineHeight: '32px',
});

const itemButtonSx: SxProps<Theme> = (theme) => ({
  borderBottom: `1px solid ${theme.palette.rule.soft}`,
  '&:last-of-type': { borderBottom: 'none' },
});

const itemTextSx: SxProps<Theme> = (theme) => ({
  '& .MuiListItemText-primary': {
    fontFamily: theme.fonts.sans,
    fontSize: 13,
    color: theme.palette.ink.primary,
  },
});

export default function FilterOptions(props) {
  const { filteredLocations, filteredTopics, setFilteredLocations, setFilteredTopics } = props;
  const courseId = useCourseId();

  const queueData = useQuery(api.home.home_get.getQueueData, { courseId });
  const rawLocations = queueData?.current_locations || [];
  const locations = rawLocations.length === 0 ? ['Office Hours'] : rawLocations;
  const currAssignments = queueData?.current_assignments || [];

  const handleToggle = (group, value) => () => {
    const array = group === FilterGroup.Location ? filteredLocations : filteredTopics;
    const currentIndex = array.indexOf(value);
    const newChecked =
      group === FilterGroup.Location ? [...filteredLocations] : [...filteredTopics];

    if (currentIndex === -1) {
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
        sx={{ width: '100%', maxWidth: 320, bgcolor: 'paper.1', py: 0 }}
        component="nav"
        subheader={<ListSubheader sx={subheaderSx}>Locations</ListSubheader>}
      >
        {locations.map((value) => {
          const labelId = `checkbox-list-label-${value}`;
          return (
            <ListItem key={value} disablePadding>
              <ListItemButton
                onClick={handleToggle(FilterGroup.Location, value)}
                dense
                sx={itemButtonSx}
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
                <ListItemText id={labelId} primary={value} sx={itemTextSx} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <List
        sx={{ width: '100%', maxWidth: 320, bgcolor: 'paper.1', py: 0 }}
        component="nav"
        subheader={<ListSubheader sx={subheaderSx}>Topics</ListSubheader>}
      >
        {currAssignments.map((topic) => {
          const labelId = `checkbox-list-label-${topic._id}`;
          return (
            <ListItem key={topic._id} disablePadding>
              <ListItemButton
                onClick={handleToggle(FilterGroup.Topic, topic._id)}
                dense
                sx={itemButtonSx}
              >
                <ListItemIcon>
                  <Checkbox
                    edge="start"
                    checked={filteredTopics.indexOf(topic._id) !== -1}
                    tabIndex={-1}
                    disableRipple
                    inputProps={{ 'aria-labelledby': labelId }}
                  />
                </ListItemIcon>
                <ListItemText id={labelId} primary={topic.name} sx={itemTextSx} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </div>
  );
}
