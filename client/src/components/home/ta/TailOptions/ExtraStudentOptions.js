import React, { useState } from 'react';
import { Divider, Menu, MenuItem, IconButton, Typography } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import { Help } from '@mui/icons-material';
import ChatIcon from '@mui/icons-material/Chat';

export default function ExtraStudentOptions(props) {
    const { student } = props

    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    function handleFix() {
        //TODO: TIE INTO SERVER
        console.log(`${student.name} is fixing`);
    }

    function handleMessage() {
        //TODO: TIE INTO SERVER
        console.log(`messaging ${student.name}`);
    }

    return (
        <div>
            <IconButton
                id="extras-button"
                aria-controls={open ? 'extras-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onClick={handleClick}
            >
                <SettingsIcon />
            </IconButton>
            <Menu
                id="extras-menu"
                aria-labelledby="extras-button"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'center',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'center',
                    horizontal: 'left',
                }}
            >
                <MenuItem onClick={() => {handleClose(); handleFix()}}>
                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                        <div>
                            <IconButton color="error">
                                <Help />
                            </IconButton>
                        </div>
                        <div>
                            <Typography sx={{fontSize: 16}}>
                                Ask to Fix
                            </Typography>
                        </div>
                    </div>
                </MenuItem>
            
                <Divider sx={{ my: 0.5 }} />
            
                <MenuItem onClick={() => {handleClose(); handleMessage()}}>
                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                        <div>
                            <IconButton color="primary">
                                <ChatIcon />
                            </IconButton>
                        </div>
                        <div>
                            <Typography sx={{fontSize: 16}}>
                                Message
                            </Typography>
                        </div>
                    </div>
                </MenuItem>
            </Menu>
        </div>
    );
}
