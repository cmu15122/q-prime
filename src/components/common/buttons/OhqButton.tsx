import * as React from 'react';
import { Button, ButtonProps, IconButton, IconButtonProps } from '@mui/material';
import { styled } from '@mui/material/styles';

export type OhqButtonVariant = 'primary' | 'ghost' | 'danger' | 'warning' | 'icon';
export type OhqButtonTone = 'default' | 'danger';
export type OhqButtonSize = 'sm' | 'md';

export type OhqButtonProps = Omit<ButtonProps, 'variant' | 'color' | 'size'> & {
  variant: OhqButtonVariant;
  size?: OhqButtonSize;
  /** Only meaningful for `variant="icon"` — switches default ink color to red. */
  tone?: OhqButtonTone;
  fullWidth?: boolean;
};

type StyledTextButtonProps = {
  $variant: Exclude<OhqButtonVariant, 'icon'>;
  $size: OhqButtonSize;
};

const StyledTextButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== '$variant' && prop !== '$size',
})<StyledTextButtonProps>(({ theme, $variant, $size }) => {
  const isSm = $size === 'sm';
  const p = theme.palette;
  const base: React.CSSProperties = {
    borderRadius: 2,
    fontFamily: theme.fonts.ui,
    fontWeight: 600,
    fontSize: isSm ? 12 : 13,
    padding: isSm ? '5px 11px' : '7px 14px',
    letterSpacing: '0.005em',
    textTransform: 'none',
    transition: '120ms ease',
    boxShadow: 'none',
    minWidth: 0,
    lineHeight: 1.2,
  };

  let bg = 'transparent';
  let borderColor = p.rule.default;
  let color = p.ink.primary;

  if ($variant === 'primary') {
    bg = p.forest.main;
    borderColor = p.forest.main;
    color = p.paper[1];
  } else if ($variant === 'danger') {
    bg = p.error.main;
    borderColor = p.error.main;
    color = p.paper[1];
  } else if ($variant === 'warning') {
    bg = p.amber.main;
    borderColor = p.amber.main;
    color = p.amber.contrastText;
  }
  // 'ghost' uses the defaults set above.

  return {
    ...base,
    backgroundColor: bg,
    border: `1px solid ${borderColor}`,
    color,
    '&:hover': {
      backgroundColor: bg,
      borderColor,
      color,
      filter: 'brightness(0.95)',
      boxShadow: 'none',
    },
    '&:active': {
      backgroundColor: bg,
      borderColor,
      color,
      boxShadow: 'none',
    },
    '&.Mui-disabled': {
      opacity: 0.4,
      backgroundColor: bg,
      borderColor,
      color,
    },
  };
});

type StyledIconButtonProps = {
  $tone: OhqButtonTone;
};

const StyledIconButton = styled(IconButton, {
  shouldForwardProp: (prop) => prop !== '$tone',
})<StyledIconButtonProps>(({ theme, $tone }) => {
  const color = $tone === 'danger' ? theme.palette.error.main : theme.palette.ink.primary;
  return {
    width: 32,
    height: 32,
    padding: 0,
    borderRadius: 2,
    border: '1px solid transparent',
    backgroundColor: 'transparent',
    color,
    transition: '120ms ease',
    boxShadow: 'none',
    '&:hover': {
      border: `1px solid ${theme.palette.rule.default}`,
      backgroundColor: theme.palette.paper[2],
      color,
      boxShadow: 'none',
    },
    '&.Mui-disabled': {
      opacity: 0.4,
      color,
    },
    '& .MuiSvgIcon-root': {
      fontSize: 18,
    },
  };
});

const OhqButton = React.forwardRef<HTMLButtonElement, OhqButtonProps>(
  function OhqButton(props, ref) {
    const { variant, size = 'md', tone = 'default', children, ...rest } = props;

    if (variant === 'icon') {
      const {
        fullWidth: _fullWidth,
        startIcon: _startIcon,
        endIcon: _endIcon,
        ...iconRest
      } = rest as ButtonProps;
      return (
        <StyledIconButton ref={ref} $tone={tone} disableRipple {...(iconRest as IconButtonProps)}>
          {children}
        </StyledIconButton>
      );
    }

    return (
      <StyledTextButton ref={ref} $variant={variant} $size={size} disableElevation {...rest}>
        {children}
      </StyledTextButton>
    );
  },
);

export default OhqButton;
