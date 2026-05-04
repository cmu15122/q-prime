import { createTheme, Shadows, Theme, ThemeOptions } from '@mui/material';

declare module '@mui/material/styles' {
  interface Palette {
    forest: { main: string; soft: string };
    amber: { main: string; contrastText: string };
    ink: { primary: string; secondary: string; muted: string };
    paper: { 1: string; 2: string; 3: string };
    rule: { default: string; soft: string };
  }
  interface PaletteOptions {
    forest?: { main: string; soft: string };
    amber?: { main: string; contrastText: string };
    ink?: { primary: string; secondary: string; muted: string };
    paper?: { 1: string; 2: string; 3: string };
    rule?: { default: string; soft: string };
  }
  interface Theme {
    fonts: { ui: string; sans: string; mono: string; serif: string };
  }
  interface ThemeOptions {
    fonts?: { ui: string; sans: string; mono: string; serif: string };
  }
}

type Mode = 'light' | 'dark';

// Design tokens — "carbon paper" editorial aesthetic. Sharp radii, hairline borders,
// almost no shadow; depth is communicated by paper-tier (paper / paper-2 / paper-3).
const tokens = {
  radius: { xs: 1, sm: 2, md: 3, lg: 4, xl: 6, full: 9999 },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 },
  border: { thin: 1, medium: 2 },
  transition: { fast: '0.15s ease', normal: '0.2s ease' },
  shadows: {
    light: {
      sm: 'none',
      md: 'none',
      lg: '0 8px 24px rgba(26, 26, 26, 0.08)',
    },
    dark: {
      sm: 'none',
      md: 'none',
      lg: '0 8px 28px rgba(0, 0, 0, 0.5)',
    },
  },
};

// Carbon-paper palettes. Light = warm cream paper + ink. Dark = warm carbon + cream.
const colors = {
  light: {
    primary: { main: '#14532D', light: '#1F6B3A', dark: '#0F3D20' },
    accent: { main: '#EAB308', light: '#FACC15', dark: '#CA8A04' },
    // bg.default = paper, bg.paper = paper-2 (raised), bg.elevated/subtle = paper-3 (recessed wells)
    bg: { default: '#F5F1E8', paper: '#EFE9DA', elevated: '#E8E1CD', subtle: '#E8E1CD' },
    text: { primary: '#1A1A1A', secondary: '#6B665C', muted: '#8A8273' },
    border: {
      default: 'rgba(26, 26, 26, 0.18)',
      subtle: 'rgba(26, 26, 26, 0.10)',
      hover: 'rgba(26, 26, 26, 0.42)',
    },
    success: { main: '#15803D', light: '#D8E9DD', dark: '#14532D' },
    error: { main: '#B91C1C', light: '#F1D9D5', dark: '#7F1D1D' },
    info: { main: '#3B6FA0', light: '#DCE5F0', dark: '#274D77' },
    warning: { main: '#A05A06', light: '#F1E4C7', dark: '#7A4205' },
  },
  dark: {
    primary: { main: '#4ADE80', light: '#6BE89E', dark: '#22C55E' },
    accent: { main: '#FACC15', light: '#FDE047', dark: '#EAB308' },
    // bg.default = paper, bg.paper = paper-2 (raised cards), bg.elevated = paper-3 (deepest wells)
    bg: { default: '#16140F', paper: '#1E1B14', elevated: '#0C0B08', subtle: '#0C0B08' },
    text: { primary: '#E8E0CC', secondary: '#B8B0A0', muted: '#7A7363' },
    border: {
      default: 'rgba(232, 224, 204, 0.16)',
      subtle: 'rgba(232, 224, 204, 0.08)',
      hover: 'rgba(232, 224, 204, 0.36)',
    },
    success: { main: '#4ADE80', light: 'rgba(74, 222, 128, 0.18)', dark: '#22C55E' },
    error: { main: '#F87171', light: 'rgba(248, 113, 113, 0.18)', dark: '#DC2626' },
    info: { main: '#93B6DD', light: 'rgba(147, 182, 221, 0.18)', dark: '#6B9BD2' },
    warning: { main: '#FACC15', light: 'rgba(250, 204, 21, 0.18)', dark: '#EAB308' },
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
  h1: { fontSize: '2.75rem', fontWeight: 600, letterSpacing: '-0.02em' },
  h2: { fontSize: '2rem', fontWeight: 600, letterSpacing: '-0.015em' },
  h3: { fontSize: '1.625rem', fontWeight: 600, letterSpacing: '-0.01em' },
  h4: { fontSize: '1.375rem', fontWeight: 600, letterSpacing: '-0.005em' },
  h5: { fontSize: '1.125rem', fontWeight: 600, letterSpacing: '-0.002em' },
  h6: { fontSize: '1rem', fontWeight: 600 },
  body1: { fontSize: '0.9375rem', lineHeight: 1.55, fontWeight: 450 },
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
      styleOverrides: {
        body: {
          backgroundColor: c.bg.default,
          color: c.text.primary,
          // grain overlay — see App.css body::before; CSS variables here so it
          // can pick the right tile per mode without a JS handoff.
          '--ohq-grain-tile': isLight
            ? 'url(/landing/landing-noise.svg)'
            : 'url(/landing/landing-noise-dark.svg)',
          '--ohq-grain-blend': isLight ? 'multiply' : 'screen',
          '--ohq-grain-opacity': isLight ? 0.4 : 0.22,
          '--ohq-paper': c.bg.default,
          '--ohq-paper-2': c.bg.paper,
          '--ohq-paper-3': c.bg.elevated,
          '--ohq-ink': c.text.primary,
          '--ohq-ink-2': c.text.secondary,
          '--ohq-muted': c.text.muted,
          '--ohq-rule': c.border.default,
          '--ohq-rule-soft': c.border.subtle,
          // `--ohq-course-primary` / `--ohq-course-secondary` are set by the
          // /_theme/<slug>.css response when the user is on a course page.
          // When absent (landing, /create), `var(..., fallback)` keeps the
          // standard forest + amber.
          '--ohq-forest': `var(--ohq-course-primary, ${c.primary.main})`,
          '--ohq-forest-soft': c.primary.light,
          '--ohq-amber': `var(--ohq-course-secondary, ${c.accent.main})`,
          '--ohq-serif': '"Instrument Serif", "Times New Roman", Times, serif',
          '--ohq-sans': '"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          '--ohq-ui': '"Plus Jakarta Sans", "DM Sans", sans-serif',
          '--ohq-mono': '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: tokens.radius.sm,
          padding: '8px 16px',
          fontWeight: 500,
          boxShadow: 'none',
          transition: `background-color ${tokens.transition.fast}, border-color ${tokens.transition.fast}`,
          '&:hover, &:active': { boxShadow: 'none' },
          '&:focus-visible': { outline: `2px solid ${c.primary.main}`, outlineOffset: '2px' },
        },
        contained: {
          color: isLight ? '#F5F1E8' : '#0C0B08',
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
          boxShadow: 'none',
          transition: `border-color ${tokens.transition.fast}`,
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
          // Carbon-paper aesthetic: transparent field with a visible hairline
          // border, not a recessed grey well (the previous treatment looked
          // muddy in light mode — cream-grey on cream paper).
          '& .MuiOutlinedInput-root': {
            borderRadius: tokens.radius.md,
            backgroundColor: 'transparent',
            transition: `border-color ${tokens.transition.fast}`,
            '& fieldset': {
              borderWidth: tokens.border.thin,
              borderColor: c.border.default,
              transition: `border-color ${tokens.transition.fast}`,
            },
            '&:hover fieldset': { borderColor: c.border.hover },
            '&.Mui-focused': {
              backgroundColor: 'transparent',
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
          backgroundColor: 'transparent',
          transition: `border-color ${tokens.transition.fast}`,
          '& fieldset': { borderWidth: tokens.border.thin, borderColor: c.border.default },
          '&:hover fieldset': { borderColor: c.border.hover },
          '&.Mui-focused': {
            backgroundColor: 'transparent',
            '& fieldset': { borderColor: c.primary.main, borderWidth: tokens.border.medium },
          },
        },
        input: { padding: '12px 14px' },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        // MUI's default resting transform assumes 16.5px vertical input padding;
        // recenter to match our 12px override on MuiOutlinedInput.input above.
        outlined: {
          transform: 'translate(14px, 12px) scale(1)',
          '&.MuiInputLabel-shrink': {
            transform: 'translate(14px, -9px) scale(0.75)',
          },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: { root: { fontSize: '15px' } },
    },
    MuiAppBar: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          backgroundColor: c.bg.default,
          color: c.text.primary,
          boxShadow: 'none',
          borderBottom: `1px solid ${c.border.default}`,
          backgroundImage: 'none',
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
          '&:hover': { backgroundColor: c.bg.elevated },
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
      contrastText: isLight ? '#F5F1E8' : '#0C0B08',
    },
    secondary: {
      main: c.accent.main,
      light: c.accent.light,
      dark: c.accent.dark,
      contrastText: '#1A1A1A',
    },
    background: { default: c.bg.default, paper: c.bg.paper },
    text: { primary: c.text.primary, secondary: c.text.secondary },
    success: { main: c.success.main, light: c.success.light, dark: c.success.dark },
    error: { main: c.error.main, light: c.error.light, dark: c.error.dark },
    info: { main: c.info.main, light: c.info.light, dark: c.info.dark },
    warning: { main: c.warning.main, light: c.warning.light, dark: c.warning.dark },
    divider: c.border.default,
    // Project tokens — extend MUI palette so component code reads e.g.
    // `palette.forest.main` instead of `var(--ohq-forest)`.
    forest: { main: c.primary.main, soft: c.primary.light },
    amber: { main: c.accent.main, contrastText: '#1A1A1A' },
    ink: { primary: c.text.primary, secondary: c.text.secondary, muted: c.text.muted },
    paper: { 1: c.bg.default, 2: c.bg.paper, 3: c.bg.elevated },
    rule: { default: c.border.default, soft: c.border.subtle },
  };
};

const createFonts = () => ({
  ui: '"Plus Jakarta Sans", "DM Sans", sans-serif',
  sans: '"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  mono: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
  serif: '"Instrument Serif", "Times New Roman", Times, serif',
});

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
    fonts: createFonts(),
    components: createComponents(mode),
  } as ThemeOptions);
};

export const lightTheme = createThemeForMode('light');
export const darkTheme = createThemeForMode('dark');

// Defaults for the per-course color picker. Mirror colors.light.{primary,accent}.main.
export const DEFAULT_THEME_PRIMARY = colors.light.primary.main;
export const DEFAULT_THEME_SECONDARY = colors.light.accent.main;
