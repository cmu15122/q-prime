import { createTheme, Shadows, Theme, ThemeOptions } from '@mui/material';

declare module '@mui/material/styles' {
  interface Theme {
    alternateColors: {
      cancel: string;
      unfreeze: string;
      navbar: string;
      navbarText: string;
      darkerPrimary: string;
      alternatePaper: string;
    };
  }
  interface ThemeOptions {
    alternateColors?: {
      cancel?: string;
      unfreeze?: string;
      navbar?: string;
      navbarText?: string;
      darkerPrimary?: string;
      alternatePaper?: string;
    };
  }
}

type Mode = 'light' | 'dark';

// Design tokens - "Modern Dev Tool" aesthetic (Linear, Notion, Convex inspired)
const tokens = {
  radius: { xs: 2, sm: 4, md: 6, lg: 8, xl: 10, full: 9999 },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 },
  border: { thin: 1, medium: 2 },
  transition: { fast: '0.15s ease', normal: '0.2s ease' },
  shadows: {
    light: {
      sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
      md: '0 2px 4px rgba(0, 0, 0, 0.06)',
      lg: '0 4px 12px rgba(0, 0, 0, 0.08)',
    },
    dark: {
      sm: '0 1px 2px rgba(0, 0, 0, 0.2)',
      md: '0 2px 4px rgba(0, 0, 0, 0.25)',
      lg: '0 4px 12px rgba(0, 0, 0, 0.3)',
    },
  },
};

// Color palettes per mode
const colors = {
  light: {
    primary: { main: '#15803D', light: '#16A34A', dark: '#14532D' },
    accent: { main: '#EAB308', light: '#FDE047', dark: '#CA8A04' },
    bg: { default: '#FAFAFA', paper: '#F4F4F5', elevated: '#F4F4F5', subtle: '#E4E4E7' },
    text: { primary: '#18181B', secondary: '#71717A', muted: '#A1A1AA' },
    border: { default: '#E4E4E7', subtle: '#F4F4F5', hover: '#D4D4D8' },
    success: { main: '#15803D', light: '#D1FAE5', dark: '#14532D' },
    error: { main: '#DC2626', light: '#FEE2E2', dark: '#B91C1C' },
    info: { main: '#6B9BD2', light: '#E8F1FB', dark: '#5B8AC2' },
    warning: { main: '#D97706', light: '#FEF3C7', dark: '#B45309' },
  },
  dark: {
    primary: { main: '#16A34A', light: '#22C55E', dark: '#15803D' },
    accent: { main: '#FDE047', light: '#FEF08A', dark: '#EAB308' },
    bg: { default: '#09090B', paper: '#18181B', elevated: '#27272A', subtle: '#18181B' },
    text: { primary: '#FAFAFA', secondary: '#A1A1AA', muted: '#71717A' },
    border: { default: '#27272A', subtle: '#3F3F46', hover: '#3F3F46' },
    success: { main: '#16A34A', light: '#166534', dark: '#15803D' },
    error: { main: '#F87171', light: '#7F1D1D', dark: '#EF4444' },
    info: { main: '#93B8E0', light: '#1E3A5A', dark: '#7EACD8' },
    warning: { main: '#FBBF24', light: '#78350F', dark: '#F59E0B' },
  },
};

const createShadowArray = (mode: Mode): Shadows => {
  const s = tokens.shadows[mode];
  return [
    'none',
    s.sm,
    s.sm,
    s.md,
    s.md,
    s.md,
    s.md,
    s.md,
    s.lg,
    s.lg,
    s.lg,
    s.lg,
    s.lg,
    s.lg,
    s.lg,
    s.lg,
    s.lg,
    s.lg,
    s.lg,
    s.lg,
    s.lg,
    s.lg,
    s.lg,
    s.lg,
    s.lg,
  ] as Shadows;
};

const typography = {
  fontFamily:
    '"DM Sans", "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  fontSize: 15,
  htmlFontSize: 15,
  h1: { fontSize: '3rem', fontWeight: 600, letterSpacing: '-0.02em' },
  h2: { fontSize: '2.25rem', fontWeight: 600, letterSpacing: '-0.02em' },
  h3: { fontSize: '1.875rem', fontWeight: 600, letterSpacing: '-0.01em' },
  h4: { fontSize: '1.5rem', fontWeight: 600 },
  h5: { fontSize: '1.25rem', fontWeight: 600 },
  h6: { fontSize: '1.125rem', fontWeight: 600 },
  body1: { fontSize: '1rem', lineHeight: 1.6, fontWeight: 450 },
  body2: { fontSize: '0.875rem', lineHeight: 1.5, fontWeight: 450 },
  button: {
    fontSize: '0.875rem',
    fontWeight: 500,
    textTransform: 'none' as const,
    letterSpacing: '0.01em',
  },
};

// Generate component overrides based on mode
const createComponents = (mode: Mode) => {
  const c = colors[mode];
  const s = tokens.shadows[mode];
  const isLight = mode === 'light';
  const hoverBg = isLight ? 'rgba(21, 128, 61, 0.06)' : 'rgba(22, 163, 74, 0.1)';
  const selectedBg = isLight ? 'rgba(21, 128, 61, 0.08)' : 'rgba(22, 163, 74, 0.15)';
  const selectedHoverBg = isLight ? 'rgba(21, 128, 61, 0.12)' : 'rgba(22, 163, 74, 0.2)';
  const outlineHoverBg = isLight ? 'rgba(21, 128, 61, 0.04)' : 'rgba(22, 163, 74, 0.08)';

  return {
    MuiCssBaseline: {
      styleOverrides: { body: { backgroundColor: c.bg.default } },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: tokens.radius.md,
          padding: '8px 16px',
          fontWeight: 500,
          boxShadow: 'none',
          transition: `background-color ${tokens.transition.fast}, border-color ${tokens.transition.fast}`,
          '&:hover, &:active': { boxShadow: 'none' },
          '&:focus-visible': { outline: `2px solid ${c.primary.main}`, outlineOffset: '2px' },
        },
        contained: {
          color: isLight ? '#FFFFFF' : '#09090B',
          '&:hover': { backgroundColor: c.primary.light },
          '&:active': { backgroundColor: c.primary.dark },
        },
        containedPrimary: {
          backgroundColor: c.primary.main,
          '&:hover': { backgroundColor: c.primary.light },
          '&:active': { backgroundColor: c.primary.dark },
        },
        outlined: {
          borderWidth: tokens.border.thin,
          borderColor: c.border.default,
          boxShadow: 'none',
          '&:hover': {
            borderWidth: tokens.border.thin,
            backgroundColor: outlineHoverBg,
            borderColor: c.primary.main,
            boxShadow: 'none',
          },
        },
        text: {
          boxShadow: 'none',
          '&:hover': { backgroundColor: hoverBg, boxShadow: 'none' },
        },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          border: `${tokens.border.thin}px solid ${c.border.default}`,
          borderRadius: tokens.radius.lg,
          backgroundColor: c.bg.paper,
          boxShadow: s.sm,
          transition: `border-color ${tokens.transition.fast}`,
          '&:hover': { borderColor: c.border.hover },
        },
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: { backgroundImage: 'none', backgroundColor: c.bg.paper },
        rounded: { borderRadius: tokens.radius.lg },
        elevation1: { boxShadow: s.sm },
        elevation2: { boxShadow: s.sm },
        elevation3: { boxShadow: s.md },
        elevation4: { boxShadow: s.md },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: tokens.radius.lg,
          backgroundColor: c.bg.paper,
          border: `${tokens.border.thin}px solid ${c.border.default}`,
          boxShadow: s.lg,
        },
        backdrop: { backgroundColor: isLight ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.6)' },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontSize: '1.25rem',
          fontWeight: 600,
          padding: `${tokens.spacing.xl}px ${tokens.spacing.xl}px ${tokens.spacing.lg}px`,
          color: c.text.primary,
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: { padding: `${tokens.spacing.lg}px ${tokens.spacing.xl}px` },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: `${tokens.spacing.lg}px ${tokens.spacing.xl}px ${tokens.spacing.xl}px`,
          gap: tokens.spacing.md,
        },
      },
    },
    MuiTextField: {
      defaultProps: { variant: 'outlined' as const },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: tokens.radius.md,
            backgroundColor: isLight ? c.bg.subtle : c.bg.default,
            transition: `background-color ${tokens.transition.fast}, border-color ${tokens.transition.fast}`,
            '& fieldset': {
              borderWidth: tokens.border.thin,
              borderColor: 'transparent',
              transition: `border-color ${tokens.transition.fast}`,
            },
            '&:hover fieldset': { borderColor: isLight ? c.border.default : c.border.hover },
            '&.Mui-focused': {
              backgroundColor: c.bg.paper,
              '& fieldset': { borderColor: c.primary.main, borderWidth: tokens.border.medium },
            },
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: tokens.radius.md,
          backgroundColor: isLight ? c.bg.subtle : c.bg.default,
          transition: `background-color ${tokens.transition.fast}, border-color ${tokens.transition.fast}`,
          '& fieldset': { borderWidth: tokens.border.thin, borderColor: 'transparent' },
          '&:hover fieldset': { borderColor: isLight ? c.border.default : c.border.hover },
          '&.Mui-focused': {
            backgroundColor: c.bg.paper,
            '& fieldset': { borderColor: c.primary.main, borderWidth: tokens.border.medium },
          },
        },
        input: { padding: '12px 14px' },
      },
    },
    MuiInputBase: {
      styleOverrides: { root: { fontSize: '15px' } },
    },
    MuiAppBar: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          backgroundColor: isLight ? c.primary.main : c.bg.paper,
          color: isLight ? '#FFFFFF' : c.text.primary,
          boxShadow: 'none',
          borderBottom: `1px solid ${isLight ? c.primary.dark : c.border.default}`,
        },
      },
    },
    MuiToolbar: {
      styleOverrides: { root: { minHeight: '64px !important' } },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: tokens.radius.sm,
          fontWeight: 500,
          transition: `background-color ${tokens.transition.fast}`,
        },
        filled: { boxShadow: 'none', '&:hover': { boxShadow: 'none' } },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { borderBottom: `1px solid ${c.border.default}`, padding: `${tokens.spacing.lg}px` },
        head: {
          fontWeight: 600,
          color: c.text.secondary,
          backgroundColor: isLight ? c.bg.subtle : c.bg.default,
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          backgroundColor: c.bg.paper,
          transition: `background-color ${tokens.transition.fast}`,
          '&:hover': { backgroundColor: isLight ? c.bg.subtle : c.bg.elevated },
          '& td:first-of-type': {
            borderTopLeftRadius: tokens.radius.xs,
            borderBottomLeftRadius: tokens.radius.xs,
          },
          '& td:last-of-type': {
            borderTopRightRadius: tokens.radius.xs,
            borderBottomRightRadius: tokens.radius.xs,
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: { minHeight: 48 },
        indicator: { height: 2, borderRadius: '2px 2px 0 0', backgroundColor: c.primary.main },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          fontSize: '0.9375rem',
          minHeight: 48,
          padding: `${tokens.spacing.md}px ${tokens.spacing.xl}px`,
          color: c.text.secondary,
          transition: `color ${tokens.transition.fast}, background-color ${tokens.transition.fast}`,
          '&:hover': { color: c.text.primary, backgroundColor: hoverBg },
          '&.Mui-selected': { color: c.primary.main, fontWeight: 600 },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: isLight ? c.text.primary : c.bg.elevated,
          color: isLight ? '#FFFFFF' : c.text.primary,
          fontSize: '0.8125rem',
          padding: `${tokens.spacing.sm}px ${tokens.spacing.md}px`,
          borderRadius: tokens.radius.sm,
          border: isLight ? 'none' : `1px solid ${c.border.default}`,
          boxShadow: s.md,
        },
        arrow: { color: isLight ? c.text.primary : c.bg.elevated },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: tokens.radius.md, boxShadow: 'none', border: '1px solid' },
        standardSuccess: {
          backgroundColor: c.success.light,
          color: isLight ? c.success.dark : c.success.main,
          borderColor: `${c.success.main}${isLight ? '20' : '30'}`,
        },
        standardError: {
          backgroundColor: c.error.light,
          color: isLight ? c.error.dark : c.error.main,
          borderColor: `${c.error.main}${isLight ? '20' : '30'}`,
        },
        standardInfo: {
          backgroundColor: c.info.light,
          color: isLight ? c.info.dark : c.info.main,
          borderColor: `${c.info.main}${isLight ? '20' : '30'}`,
        },
        standardWarning: {
          backgroundColor: c.warning.light,
          color: isLight ? c.warning.dark : c.warning.main,
          borderColor: `${c.warning.main}${isLight ? '20' : '30'}`,
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: { width: 46, height: 26, padding: 0 },
        switchBase: {
          padding: 2,
          '&.Mui-checked': {
            transform: 'translateX(20px)',
            '& + .MuiSwitch-track': { backgroundColor: c.primary.main, opacity: 1 },
          },
        },
        thumb: {
          width: 22,
          height: 22,
          boxShadow: s.sm,
          backgroundColor: isLight ? undefined : c.text.primary,
        },
        track: { borderRadius: 13, backgroundColor: c.text.muted, opacity: 1 },
      },
    },
    MuiSelect: {
      styleOverrides: { root: { borderRadius: tokens.radius.md } },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: tokens.radius.lg,
          border: `${tokens.border.thin}px solid ${c.border.default}`,
          backgroundColor: c.bg.paper,
          boxShadow: s.lg,
          marginTop: tokens.spacing.xs,
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: tokens.radius.sm,
          margin: `${tokens.spacing.xs / 2}px ${tokens.spacing.sm}px`,
          padding: `10px ${tokens.spacing.md}px`,
          transition: `background-color ${tokens.transition.fast}`,
          '&:hover': { backgroundColor: hoverBg },
          '&.Mui-selected': {
            backgroundColor: selectedBg,
            '&:hover': { backgroundColor: selectedHoverBg },
          },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          height: 6,
          borderRadius: tokens.radius.full,
          backgroundColor: isLight ? c.bg.subtle : c.bg.elevated,
        },
        bar: { borderRadius: tokens.radius.full },
      },
    },
    MuiCircularProgress: {
      styleOverrides: { root: { color: c.primary.main } },
    },
    MuiBadge: {
      styleOverrides: { badge: { fontWeight: 600, fontSize: '0.75rem', boxShadow: 'none' } },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: tokens.radius.md,
          transition: `background-color ${tokens.transition.fast}`,
          '&:hover': { backgroundColor: hoverBg },
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          boxShadow: s.md,
          transition: `background-color ${tokens.transition.fast}`,
          '&:hover': { boxShadow: s.md },
          '&:active': { boxShadow: s.sm },
        },
      },
    },
    MuiDivider: {
      styleOverrides: { root: { borderColor: c.border.default } },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: tokens.radius.md,
          transition: `background-color ${tokens.transition.fast}`,
          '&:hover': { backgroundColor: hoverBg },
          '&.Mui-selected': {
            backgroundColor: selectedBg,
            '&:hover': { backgroundColor: selectedHoverBg },
          },
        },
      },
    },
    MuiSkeleton: {
      styleOverrides: {
        root: {
          borderRadius: tokens.radius.md,
          backgroundColor: isLight ? c.bg.subtle : c.bg.elevated,
        },
      },
    },
    MuiBackdrop: {
      styleOverrides: {
        root: { backgroundColor: isLight ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.6)' },
      },
    },
  };
};

const createPalette = (mode: Mode) => {
  const c = colors[mode];
  const isLight = mode === 'light';
  return {
    mode,
    primary: {
      main: c.primary.main,
      light: c.primary.light,
      dark: c.primary.dark,
      contrastText: isLight ? '#FFFFFF' : '#09090B',
    },
    secondary: {
      main: c.accent.main,
      light: c.accent.light,
      dark: c.accent.dark,
      contrastText: isLight ? '#18181B' : '#09090B',
    },
    background: { default: c.bg.default, paper: c.bg.paper },
    text: { primary: c.text.primary, secondary: c.text.secondary },
    success: { main: c.success.main, light: c.success.light, dark: c.success.dark },
    error: { main: c.error.main, light: c.error.light, dark: c.error.dark },
    info: { main: c.info.main, light: c.info.light, dark: c.info.dark },
    warning: { main: c.warning.main, light: c.warning.light, dark: c.warning.dark },
    divider: c.border.default,
  };
};

const createAlternateColors = (mode: Mode) => {
  const c = colors[mode];
  const isLight = mode === 'light';
  return {
    alternatePaper: isLight ? c.bg.subtle : c.bg.elevated,
    cancel: c.text.secondary,
    unfreeze: isLight ? '#7C3AED' : '#A78BFA',
    navbar: isLight ? c.primary.main : c.primary.main,
    navbarText: isLight ? '#FFFFFF' : '#000000',
    darkerPrimary: c.primary.dark,
  };
};

const createThemeForMode = (mode: Mode): Theme => {
  const c = colors[mode];
  const baseTypo =
    mode === 'dark'
      ? {
          ...typography,
          h1: { ...typography.h1, color: c.text.primary },
          h2: { ...typography.h2, color: c.text.primary },
          h3: { ...typography.h3, color: c.text.primary },
          h4: { ...typography.h4, color: c.text.primary },
          h5: { ...typography.h5, color: c.text.primary },
          h6: { ...typography.h6, color: c.text.primary },
          body1: { ...typography.body1, color: c.text.primary },
          body2: { ...typography.body2, color: c.text.primary },
          button: { ...typography.button, color: c.text.primary },
        }
      : typography;

  return createTheme({
    palette: createPalette(mode),
    shadows: createShadowArray(mode),
    shape: { borderRadius: tokens.radius.md },
    typography: baseTypo,
    alternateColors: createAlternateColors(mode),
    components: createComponents(mode),
  } as ThemeOptions);
};

export const lightTheme = createThemeForMode('light');
export const darkTheme = createThemeForMode('dark');
