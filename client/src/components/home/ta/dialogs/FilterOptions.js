import React, { useState, useEffect } from "react";

import { List, ListSubheader, ListItem,
    ListItemButton, ListItemIcon, ListItemText, 
    Checkbox, IconButton , Popover,
} from '@mui/material';

import SettingsService from "../../../../services/SettingsService";

function createData(topic_id, name) {
    return { topic_id, name };
}

let date = new Date();

export default function FilterOptions(props) {
    const { queueData } = props;
    const [checked, setChecked] = React.useState([0]);
    
    const handleToggle = (value) => () => {
      const currentIndex = checked.indexOf(value);
      const newChecked = [...checked];
  
      if (currentIndex === -1) {
        newChecked.push(value);
      } else {
        newChecked.splice(currentIndex, 1);
      }
  
      setChecked(newChecked);
    };

    const [locations, setLocations] = useState([]);
    const [topics, setTopics] = useState([]);

    useEffect(() => {
        if (queueData != null) {
            updateTopics(queueData.topics);
            updateLocations();
        }
    }, [queueData]);

    function updateTopics(newTopics) {
        let newRows = [];
        newTopics.forEach(topic => {
            newRows.push(createData(
                topic.assignment_id,
                topic.name,
            ));
        });
        newRows.push(createData(-1, "Other"));
        setTopics(newRows);
        console.log(newRows);
    }

    function updateLocations() {
        let day = date.getDay()
        let newLocations = {}
        SettingsService.getLocations().then(res => {
            let dayDict = res.data.dayDictionary;
            newLocations = dayDict;

            let roomsForDay = (newLocations && newLocations[day]) ? newLocations[day] : ["Office Hours"];
            setLocations(roomsForDay);
        })
    }

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
                <ListItem
                    key={value}
                    disablePadding
                >
                    <ListItemButton role={undefined} onClick={handleToggle(value)} dense>
                    <ListItemIcon>
                        <Checkbox
                        edge="start"
                        checked={checked.indexOf(value) !== -1}
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
            {topics.map((value) => {
                const labelId = `checkbox-list-label-${value.name}`;

                return (
                <ListItem
                    key={value.id}
                    disablePadding
                >
                    <ListItemButton role={undefined} onClick={handleToggle(value.name)} dense>
                    <ListItemIcon>
                        <Checkbox
                        edge="start"
                        checked={checked.indexOf(value) !== -1}
                        tabIndex={-1}
                        disableRipple
                        inputProps={{ 'aria-labelledby': labelId }}
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