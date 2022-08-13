import React, { useState } from 'react';
import { Divider, Menu, MenuItem, IconButton, Typography } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import { Help } from '@mui/icons-material';
import ChatIcon from '@mui/icons-material/Chat';
import HomeService from '../../../../services/HomeService';

import MessageDialog from '../dialogs/MessageDialog';

export default function ExtraStudentOptions(props) {
    const { student, handleClickUpdateQ, index } = props

    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const [openMessage, setOpenMessage] = useState(false);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    function handleFix() {
        HomeService.taRequestUpdateQ(JSON.stringify({
            andrewID: student.andrewID
        }));
        handleClickUpdateQ(index);
        console.log('Clicked update -- Status: ', student.status);
    }

    const handleMessage = () => {
        setOpenMessage(true);
    };

    const handleCloseDialog = () => {
        setOpenMessage(false);
    };

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

            <MessageDialog
                isOpen={openMessage}
                onClose={handleCloseDialog}
                student={student}
            />
        </div>
    );
}
