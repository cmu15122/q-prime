import * as React from 'react';
import { Dialog } from '@mui/material';
import { styled } from '@mui/material/styles';

import OhqButton, { OhqButtonVariant } from '../buttons/OhqButton';

export type DialogShellAction = {
  label: string;
  onClick?: () => void;
  /** Visual variant. Defaults: primary action -> 'primary', secondary action -> 'ghost'. */
  variant?: Exclude<OhqButtonVariant, 'icon'>;
  disabled?: boolean;
  /** Set to 'submit' + a `formId` to make this action submit a form rendered in the body. */
  type?: 'button' | 'submit';
  formId?: string;
};

export type DialogShellProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  primaryAction?: DialogShellAction;
  secondaryAction?: DialogShellAction;
  maxWidth?: 'xs' | 'sm' | 'md';
  fullWidth?: boolean;
  children?: React.ReactNode;
};

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    backgroundColor: theme.palette.paper[1],
    border: `1px solid ${theme.palette.rule.default}`,
    borderRadius: 4,
    boxShadow: 'none',
    backgroundImage: 'none',
  },
}));

const Header = styled('div')({
  padding: '20px 24px 16px',
});

const Title = styled('div')(({ theme }) => ({
  fontFamily: theme.fonts.ui,
  fontWeight: 700,
  fontSize: 20,
  color: theme.palette.ink.primary,
  lineHeight: 1.25,
}));

const Subtitle = styled('div')(({ theme }) => ({
  fontFamily: theme.fonts.sans,
  fontSize: 14,
  color: theme.palette.ink.secondary,
  marginTop: 4,
}));

const Body = styled('div')(({ theme }) => ({
  padding: '16px 24px',
  fontFamily: theme.fonts.sans,
  color: theme.palette.ink.primary,
  fontSize: 14,
  lineHeight: 1.5,
}));

const Actions = styled('div')({
  padding: '12px 24px',
  display: 'flex',
  justifyContent: 'flex-end',
  gap: 10,
});

export default function DialogShell(props: DialogShellProps): JSX.Element {
  const {
    open,
    onClose,
    title,
    subtitle,
    primaryAction,
    secondaryAction,
    maxWidth = 'sm',
    fullWidth = true,
    children,
  } = props;

  const showActions = !!primaryAction || !!secondaryAction;

  return (
    <StyledDialog open={open} onClose={onClose} maxWidth={maxWidth} fullWidth={fullWidth}>
      <Header>
        <Title>{title}</Title>
        {subtitle && <Subtitle>{subtitle}</Subtitle>}
      </Header>
      <Body>{children}</Body>
      {showActions && (
        <Actions>
          {secondaryAction && (
            <OhqButton
              variant={secondaryAction.variant ?? 'ghost'}
              onClick={secondaryAction.onClick}
              disabled={secondaryAction.disabled}
              type={secondaryAction.type ?? 'button'}
              form={secondaryAction.formId}
            >
              {secondaryAction.label}
            </OhqButton>
          )}
          {primaryAction && (
            <OhqButton
              variant={primaryAction.variant ?? 'primary'}
              onClick={primaryAction.onClick}
              disabled={primaryAction.disabled}
              type={primaryAction.type ?? 'button'}
              form={primaryAction.formId}
            >
              {primaryAction.label}
            </OhqButton>
          )}
        </Actions>
      )}
    </StyledDialog>
  );
}
