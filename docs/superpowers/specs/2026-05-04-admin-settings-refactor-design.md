# Admin Settings Panel Refactor — Design

**Date:** 2026-05-04
**Status:** Approved
**Scope:** `src/components/settings/admin/ConfigSettings.tsx`, `src/components/settings/admin/QueueRejoinSettings.tsx`, plus a new shared `SettingRow` component.

## Problem

`ConfigSettings.tsx` lays out ~10 settings as horizontal `Stack direction="row"` rows of `[Label, Input, Save, Helper text]`. Because each input has a different width, the Save buttons end up at different x-offsets and the helper text gets squeezed at the right edge of the viewport. The result reads as a wall of misaligned Save buttons. `QueueRejoinSettings.tsx` uses a different one-off layout with a `Grid` container.

## Goals

- Eliminate the misaligned-Save-buttons appearance.
- Give helper text room to breathe.
- Keep per-setting save semantics (each setting maps to its own Convex mutation).
- Reduce visual noise: don't show Save buttons for rows the user isn't currently editing.
- Establish a reusable row primitive so future settings stay consistent.

## Non-goals

- Touching table-based admin panels: `Locations.tsx`, `QueueTopicSettings.tsx`, `TASettings.tsx`, `AccessControlSettings.tsx`. They already use a consistent dialog/table pattern.
- Touching non-admin settings panels (`NotificationSettings.tsx`, `TimerSettings.tsx`, `VideoChatSettings.tsx`, `OwnerSettings.tsx`).
- Changing the underlying mutation API or batching saves.
- Visual refresh of cards, typography, theme tokens, etc.

## Design

### `SettingRow` — new shared component

Path: `src/components/settings/common/SettingRow.tsx` (new file; `common/` subdir created under `settings/`).

**Layout:** CSS grid, two columns. Default column widths: `220px 1fr` with a `gap` of 24px. Vertical padding of 16px per row, with a 1px bottom divider (`theme.palette.divider`) between rows. Last row in a group has no divider.

**Left column (label):**
- Bold setting name (one line).
- Optional muted helper text underneath (smaller font, `text.secondary`). The text currently rendered as the trailing `Typography variant="caption"` moves here.

**Right column (control + save):**
- Flex row, `align-items: center`, `gap: 12px`, `justify-content: space-between`.
- The actual control (`TextField`, `Checkbox`, color picker stack, etc.) is passed as `children`.
- A `Save` button anchored to the right edge of the row, only rendered when `dirty === true`. Use MUI `Button variant="contained" size="small"`.
- Status text (e.g. theme save errors) renders inline below the control as a small `Typography variant="caption"`.

**Props:**

```ts
interface SettingRowProps {
  label: string;
  description?: string;
  dirty: boolean;
  onSave: () => void | Promise<void>;
  saving?: boolean;          // disables Save button while in flight
  status?: string | null;    // optional status line under the control
  isLast?: boolean;          // suppresses the bottom divider
  children: React.ReactNode; // the control(s)
}
```

**Keyboard:** `SettingRow` wraps its children in a `<form onSubmit>` so pressing Enter inside a child `TextField` triggers `onSave`. The form submit handler calls `event.preventDefault()` and then `onSave()`.

**Why a form per row instead of a global form:** preserves the existing per-setting submit semantics with no global form state. Each row stays independently testable and the Convex mutation per row stays unchanged.

### Dirty tracking pattern

Each setting in `ConfigSettings` already has a local `useState` initialized from a `useEffect` that watches `adminSettings`/`queueData`. We add a derived `dirty` boolean per setting:

```ts
const dirty = courseName !== (adminSettings?.courseName ?? '');
```

After a successful mutation, the Convex query refreshes, the `useEffect` resets the local state to the new saved value, and `dirty` flips back to false — the Save button disappears automatically. No additional state required.

For booleans (Checkbox), `dirty` is a simple `!==` against the saved boolean.

For the theme row (two color values), `dirty` is `themePrimary !== savedPrimary || themeSecondary !== savedSecondary`.

For `allowedEmailDomains` (string[]), compare via `JSON.stringify` of the trimmed-and-joined string.

### Subsection grouping in `ConfigSettings`

Within the existing `BaseCard` / `CardContent`, group the rows under four small subsection headers. A subsection header is a `Typography variant="overline"` (or `subtitle2` with muted color) plus 16–24px top margin to separate it from the previous section. No nested cards.

Order:

1. **Course**
   - Read-only line: "The current semester is {currSem}. Only [{ownerEmails}] can change the semester." Rendered as a muted paragraph (no row, no Save).
   - Course Name
   - Timezone
   - Theme (primary + secondary color pickers; status text under the row)

2. **Access**
   - Enforce Email Domain (checkbox)
   - Allowed Email Domains (text)
   - Allow Cooldown Override (checkbox)

3. **Integrations**
   - Slack Webhook URL
   - Questions Guide URL

4. **TA permissions**
   - Allow Show Others' Helping Time (checkbox)

### Theme row specifics

Inside `SettingRow`, the theme control is a horizontal `Stack` containing:

`[color swatch input] [hex TextField]  [color swatch input] [hex TextField]`

The `themeStatus` string passes to `SettingRow`'s `status` prop. On successful save, the existing logic that re-points `<link rel="stylesheet" href="/_theme/...">` is preserved unchanged.

### `QueueRejoinSettings` conversion

Replace the existing `Grid`-based layout with a single `SettingRow`:

- Label: "Queue rejoin time"
- Description: "How long after leaving the queue students can rejoin."
- Control: number `TextField` with width 80px + adjacent `"minute(s)"` text.
- `dirty`: `rejoinTime !== Math.round(queueData.rejoin_time_ms / 1000 / 60)`.
- `onSave`: existing `updateRejoinTimeMutation` call.

### Visual rhythm summary

```
┌─ BaseCard ─────────────────────────────────────────────────┐
│ Configuration Settings                                     │
│                                                            │
│ The current semester is F25. Only [...] can change it.     │
│                                                            │
│ COURSE                                                     │
│ ┌─────────────────┬────────────────────────────────────┐   │
│ │ Course Name     │ [______________]                   │   │
│ │ Display name…   │                                    │   │
│ ├─────────────────┼────────────────────────────────────┤   │
│ │ Timezone        │ [_____________]      [Save]        │   │  ← dirty
│ │ Server timezone │                                    │   │
│ ├─────────────────┼────────────────────────────────────┤   │
│ │ Theme           │ ■ [#14532D]  ■ [#854D0E]           │   │
│ │ Primary + …     │                                    │   │
│ └─────────────────┴────────────────────────────────────┘   │
│                                                            │
│ ACCESS                                                     │
│   …                                                        │
└────────────────────────────────────────────────────────────┘
```

## File-level changes

| File | Change |
|------|--------|
| `src/components/settings/common/SettingRow.tsx` | **New.** Shared row primitive described above. |
| `src/components/settings/admin/ConfigSettings.tsx` | Rewrite the body to use `SettingRow` with subsection headers. Keep all mutations and useEffects as-is; add per-setting `dirty` derivations. |
| `src/components/settings/admin/QueueRejoinSettings.tsx` | Rewrite the body to use a single `SettingRow`. |

No changes to `AdminMain.tsx`, the Convex API, the schema, or any other panel.

## Testing

Manual verification in the browser (frontend dev mode):

1. Open Admin Settings as an owner. Confirm no Save buttons are visible on initial load.
2. Edit the course name → Save button appears in that row only → click → button disappears, value persists across reload.
3. Toggle "Enforce Email Domain" → Save appears → click → button disappears.
4. Edit theme colors → Save appears → click → status text shows "Saved." inline; theme actually updates in the current tab.
5. Press Enter inside any text field → equivalent to clicking Save.
6. Verify `QueueRejoinSettings` behaves the same way.
7. Resize the window narrow; confirm the two-column grid degrades acceptably (label column may need to shrink or stack on very narrow widths — acceptable to keep two columns down to ~600px and not optimize further for mobile, since the admin panel is desktop-first).

## Risks / open questions

- **Mobile layout** is not deeply considered. Admin Settings is desktop-first; if a mobile breakpoint is needed later we can stack the columns at `< sm`.
- **`description` field** comes from the existing trailing helper text; some are short ("Display name for the course"), some imply behavior. They are kept verbatim from the current code in this refactor — no copy editing.
- **Status text for theme** currently lives inline next to the helper caption. Moving it under the control row is a minor UX shift but reads more naturally.
