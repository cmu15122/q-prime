import React, { useState, useEffect } from "react";

import { List, ListSubheader, ListItem,
    ListItemButton, ListItemIcon, ListItemText, 
    Checkbox, IconButton , Popover,
} from '@mui/material';

export default function FilterOptions(props) {
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

    return (
        <List
        sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}
        component="nav"
        aria-labelledby="nested-list-subheader"
        subheader={
            <ListSubheader component="div" id="nested-list-subheader">
            Nested List Items
            </ListSubheader>
        }
        >
            {[0, 1, 2, 3].map((value) => {
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
                    <ListItemText id={labelId} primary={`Line item ${value + 1}`} />
                    </ListItemButton>
                </ListItem>
                );
            })}
        </List>
    );
}