/**
 * Shared design tokens for the OHQ surface.
 *
 * Two exports:
 *  - `t` (typography): named text styles. `<Typography sx={t.cardTitle}>`
 *  - `s` (surface):    named box/border treatments. `<Box sx={s.hairlineBox}>`
 *
 * Combine sx tokens with extras using array sx:
 *   <Typography sx={[t.body, { mt: 2 }]}>...</Typography>
 *   <Box sx={[s.hairlineBox, { p: 2 }]}>...</Box>
 *
 * Tokens are sx callbacks so they read from the live MUI theme — they flip
 * automatically with light/dark mode and any per-course palette override.
 *
 * Add a new token here whenever the same 3+ properties recur in two or more
 * places. Don't add tokens for one-offs.
 */

import type { SxProps, Theme } from '@mui/material/styles';

type Sx = SxProps<Theme>;

// ---- Typography ----

export const t = {
  /** Bold sans card title, ~19px. Used by every BaseCard / ListCard header. */
  cardTitle: ((theme) => ({
    fontFamily: theme.fonts.ui,
    fontWeight: 700,
    fontSize: 19,
    color: theme.palette.ink.primary,
    lineHeight: 1.2,
    margin: 0,
  })) satisfies Sx,

  /** Mono label — used for [location] / [topic] inline field labels. */
  monoLabel: ((theme) => ({
    fontFamily: theme.fonts.mono,
    fontSize: 11,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    color: theme.palette.ink.muted,
  })) satisfies Sx,

  /** Mono tag — same family/size as monoLabel but ink-coloured + medium weight.
   *  Used for the [TOPIC] tag in TA queue rows. */
  monoTag: ((theme) => ({
    fontFamily: theme.fonts.mono,
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    color: theme.palette.ink.primary,
  })) satisfies Sx,

  /** DM Sans 14px ink — default body copy. */
  body: ((theme) => ({
    fontFamily: theme.fonts.sans,
    fontSize: 14,
    color: theme.palette.ink.primary,
    lineHeight: 1.5,
  })) satisfies Sx,

  /** Same as body but secondary ink. Common for descriptions / subtitles. */
  bodyMuted: ((theme) => ({
    fontFamily: theme.fonts.sans,
    fontSize: 14,
    color: theme.palette.ink.secondary,
    lineHeight: 1.5,
  })) satisfies Sx,

  /** Slightly smaller body — 13.5px — for stats lines and TA-row questions. */
  bodySmall: ((theme) => ({
    fontSize: 13.5,
    color: theme.palette.ink.secondary,
    lineHeight: 1.5,
  })) satisfies Sx,

  /** Forest 56px display — student "You are #N" position numeral. */
  positionNum: ((theme) => ({
    fontFamily: theme.fonts.ui,
    fontWeight: 700,
    fontSize: 56,
    lineHeight: 1,
    color: theme.palette.forest.main,
  })) satisfies Sx,

  /** Student name in TA-side queue rows. */
  studentName: ((theme) => ({
    fontFamily: theme.fonts.ui,
    fontWeight: 500,
    fontSize: 14,
  })) satisfies Sx,

  /** Student email below the name in queue rows. */
  studentEmail: ((theme) => ({
    fontSize: 12.5,
    color: theme.palette.ink.secondary,
    mt: '2px',
  })) satisfies Sx,

  /** Mono uppercase eyebrow used in dialogs / cards / footers. */
  eyebrow: ((theme) => ({
    fontFamily: theme.fonts.mono,
    fontSize: 11,
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
    color: theme.palette.ink.muted,
    fontWeight: 500,
  })) satisfies Sx,

  /** Forest mono timer — used by HelpTimer. */
  timerMono: ((theme) => ({
    fontFamily: theme.fonts.mono,
    fontWeight: 600,
    fontSize: 12,
    color: theme.palette.forest.main,
  })) satisfies Sx,
};

// ---- Surfaces ----

export const s = {
  /** Hairline-bordered well on paper-3 — used for boxed messages, previous-message
   *  panels in dialogs, etc. */
  hairlineBox: ((theme) => ({
    border: `1px solid ${theme.palette.rule.default}`,
    borderRadius: '4px',
    backgroundColor: theme.palette.paper[3],
    p: 1.5,
  })) satisfies Sx,

  /** Amber-bordered warning strip on faintly-tinted bg — used for cooldown /
   *  frozen / fixing-question alerts inside YourEntry. */
  amberWarning: ((theme) => ({
    border: `1px solid ${theme.palette.amber.main}`,
    borderRadius: '4px',
    backgroundColor: 'rgba(234, 179, 8, 0.06)',
    p: 1.25,
  })) satisfies Sx,

  /** Card-internal header row: title + tail (button / actions) on baseline. */
  cardHeader: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 2,
    padding: '16px 20px 12px',
  } satisfies Sx,
};
