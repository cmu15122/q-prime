import React from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  useTheme,
} from '@mui/material';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness';
import CheckIcon from '@mui/icons-material/Check';
import { useThemeContext, ThemeMode } from '../../contexts/ThemeContext';

export default function ThemeToggle() {
  const { mode, setMode, effectiveMode } = useThemeContext();
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleModeSelect = (newMode: ThemeMode) => {
    setMode(newMode);
    handleClose();
  };

  // Icon for current effective mode
  const CurrentIcon = effectiveMode === 'dark' ? DarkModeIcon : LightModeIcon;

  return (
    <>
      <Tooltip title="Theme">
        <IconButton
          onClick={handleClick}
          size="small"
          sx={{
            color: theme.alternateColors.navbarText,
            ml: 1,
          }}
          aria-controls={open ? 'theme-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
        >
          <CurrentIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Menu
        id="theme-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={() => handleModeSelect('light')}>
          <ListItemIcon>
            <LightModeIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Light</ListItemText>
          {mode === 'light' && <CheckIcon fontSize="small" sx={{ ml: 1 }} />}
        </MenuItem>
        <MenuItem onClick={() => handleModeSelect('dark')}>
          <ListItemIcon>
            <DarkModeIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Dark</ListItemText>
          {mode === 'dark' && <CheckIcon fontSize="small" sx={{ ml: 1 }} />}
        </MenuItem>
        <MenuItem onClick={() => handleModeSelect('auto')}>
          <ListItemIcon>
            <SettingsBrightnessIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Auto</ListItemText>
          {mode === 'auto' && <CheckIcon fontSize="small" sx={{ ml: 1 }} />}
        </MenuItem>
      </Menu>
    </>
  );
}
