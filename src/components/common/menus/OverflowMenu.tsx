import * as React from 'react';
import { Menu, MenuItem } from '@mui/material';
import { styled } from '@mui/material/styles';
import type { SxProps, Theme } from '@mui/material/styles';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

import OhqButton from '../buttons/OhqButton';

export type OverflowMenuItem = {
  icon?: React.ReactNode;
  label: string;
  onClick: () => void;
  variant?: 'default' | 'danger';
  disabled?: boolean;
};

export type OverflowMenuProps = {
  items: OverflowMenuItem[];
  ariaLabel?: string;
  triggerSx?: SxProps<Theme>;
};

const StyledMenu = styled(Menu)(({ theme }) => ({
  '& .MuiPaper-root': {
    backgroundColor: theme.palette.paper[1],
    border: `1px solid ${theme.palette.rule.default}`,
    borderRadius: 4,
    boxShadow: theme.shadows[2],
    backgroundImage: 'none',
    marginTop: 4,
    minWidth: 160,
  },
  '& .MuiList-root': {
    padding: '4px 0',
  },
}));

type StyledMenuItemProps = {
  $danger: boolean;
};

const StyledMenuItem = styled(MenuItem, {
  shouldForwardProp: (prop) => prop !== '$danger',
})<StyledMenuItemProps>(({ theme, $danger }) => {
  const color = $danger ? theme.palette.error.main : theme.palette.ink.primary;
  return {
    fontFamily: theme.fonts.sans,
    fontSize: 13,
    padding: '8px 14px',
    margin: 0,
    borderRadius: 0,
    color,
    gap: 10,
    minHeight: 0,
    '&:hover': {
      backgroundColor: theme.palette.paper[2],
    },
    '& .MuiSvgIcon-root': {
      fontSize: 18,
      color,
    },
  };
});

const ItemIcon = styled('span')({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 18,
  height: 18,
});

export default function OverflowMenu(props: OverflowMenuProps): JSX.Element {
  const { items, ariaLabel = 'More actions', triggerSx } = props;
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>): void => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (event?: React.SyntheticEvent | object): void => {
    if (event && 'stopPropagation' in event && typeof event.stopPropagation === 'function') {
      (event as React.SyntheticEvent).stopPropagation();
    }
    setAnchorEl(null);
  };

  const handleItemClick = (
    event: React.MouseEvent<HTMLLIElement>,
    item: OverflowMenuItem,
  ): void => {
    event.stopPropagation();
    setAnchorEl(null);
    item.onClick();
  };

  return (
    <>
      <OhqButton variant="icon" aria-label={ariaLabel} onClick={handleOpen} sx={triggerSx}>
        <MoreHorizIcon />
      </OhqButton>
      <StyledMenu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {items.map((item, idx) => (
          <StyledMenuItem
            key={`${item.label}-${idx}`}
            $danger={item.variant === 'danger'}
            disabled={item.disabled}
            onClick={(event) => handleItemClick(event, item)}
          >
            {item.icon && <ItemIcon>{item.icon}</ItemIcon>}
            <span>{item.label}</span>
          </StyledMenuItem>
        ))}
      </StyledMenu>
    </>
  );
}
