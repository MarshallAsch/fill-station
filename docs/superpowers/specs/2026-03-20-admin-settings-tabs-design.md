# Admin Settings Tabs

Redesign the settings page into a tabbed layout with a vertical sidebar, adding server-wide configuration options that are currently hardcoded or only available as environment variables.

## Approach

**Hybrid storage**: App-level settings live in a new `Setting` DB table (key-value). Infrastructure config (SMTP, database) stays in nconf/env vars and is displayed read-only.

**Tab navigation**: URL-based via `?tab=` search param, consistent with the existing history page pattern. Each tab's content is a server component where possible; only interactive forms use client components.

## Data Model

### Setting Table

| Column | Type | Notes |
|--------|------|-------|
| `key` | `STRING` | Primary key |
| `value` | `TEXT` | JSON-encoded value |

New Sequelize model in `src/lib/models/setting/index.tsx`. New CJS migration.

### Settings Keys

| Key | Type | Default | Tab |
|-----|------|---------|-----|
| `defaultInspectorId` | `string \| null` | `null` | Inspection |
| `cronHour` | `number` | `8` | Inspection |
| `cronMinute` | `number` | `0` | Inspection |
| `defaultHydroReminder1` | `number` | `180` | Inspection |
| `defaultHydroReminder2` | `number` | `30` | Inspection |
| `defaultVisualReminder1` | `number` | `60` | Inspection |
| `defaultVisualReminder2` | `number` | `30` | Inspection |
| `defaultServicePressure` | `number` | `3000` | Cylinders |
| `allowedServicePressures` | `number[]` | `[2640, 3000, 3442]` | Cylinders |

## Settings Helper

`src/lib/settings.ts` exports:

- `getSettings(): Promise<AppSettings>` — reads all rows from `Setting`, merges with defaults for missing keys, returns a typed object.
- `updateSettings(partial: Partial<AppSettings>): Promise<void>` — validates values, upserts rows, creates audit log entries for each changed key.

This helper replaces hardcoded values in `src/lib/cron.ts` and `src/app/constants/FormConstants.ts`.

## Tab Structure

Vertical sidebar layout (matching the history page pattern) with five tabs.

### Tab 1: Inspection & Maintenance

**Component type**: Client (form inputs, inspector picker, save button).

**Fields**:
- **Default Inspector** — dropdown of users with `inspector` role. Auto-assigned to new visual inspections.
- **Notification Schedule** — hour/minute inputs stored as UTC. UI shows a local timezone preview (e.g., "08:00 UTC (4:00 AM EDT)") derived from the browser's `Intl.DateTimeFormat().resolvedOptions().timeZone`.
- **Default Reminder Days** (section divider: "for new users") — four number inputs: hydro first/second, visual first/second.
- **Save Changes** button.

### Tab 2: Cylinder Defaults

**Component type**: Client (form inputs, dynamic tag list, save button).

**Fields**:
- **Default Service Pressure** — dropdown populated from the allowed pressures list.
- **Allowed Service Pressures** — tag/chip list with add/remove. Removing a pressure that is currently the default is blocked with a validation error.
- **Save Changes** button.

### Tab 3: Notifications

**Component type**: Server component. Only the "Send Test Email" button is a client island.

**Content** (read-only, pulled from nconf at render time):
- SMTP Host, Port, From Address, Shop Email displayed in a key-value grid with monospace values.
- Connection status indicator (green dot / red dot based on whether SMTP host is configured).
- **Send Test Email** button — sends to the current admin's email address via `POST /api/settings/test-email`.

Named "Notifications" instead of "Email" to future-proof for other notification channels.

### Tab 4: Users

**Component type**: Client (existing `UserListTable`).

The existing user management table moved into the tabbed layout unchanged.

### Tab 5: Audit Log

**Component type**: Client (existing `AuditLogTable`).

The existing audit log table moved into the tabbed layout unchanged.

## Page Structure

### `src/app/settings/layout.tsx`

Client component. Renders the vertical sidebar with tab navigation buttons. Reads `?tab=` search param to highlight the active tab. Follows the same pattern as `src/app/history/layout.tsx`.

Exports a `SETTINGS_TAB` enum:
```
INSPECTION, CYLINDERS, NOTIFICATIONS, USERS, AUDIT_LOG
```

Default tab: `INSPECTION`.

### `src/app/settings/page.tsx`

Server component (`'use server'`). Reads `searchParams.tab` to determine which tab content to render. Fetches data server-side:

- **Inspection tab**: `getSettings()` + list of inspector-role users.
- **Cylinders tab**: `getSettings()`.
- **Notifications tab**: nconf SMTP values.
- **Users tab**: existing user query with client includes.
- **Audit Log tab**: existing audit log query.

Passes serialized data as props to the appropriate tab component.

## API Routes

### `GET /api/settings`

Admin-only. Returns all settings as a flat JSON object with defaults applied.

### `PATCH /api/settings`

Admin-only. Accepts a partial settings object. Validates:
- `defaultInspectorId` must reference an existing user with inspector role (or null).
- `cronHour` must be 0-23, `cronMinute` must be 0-59.
- Reminder days must be 1-365.
- `defaultServicePressure` must be in the allowed pressures list.
- `allowedServicePressures` must be non-empty, all positive integers.

Creates an audit log entry for each changed key. Returns the updated settings.

### `POST /api/settings/test-email`

Admin-only. Sends a test email to the authenticated user's email address using the existing `sendEmail` transport. Returns success/failure.

## Integration Points

### Cron Job (`src/lib/cron.ts`)

Replace hardcoded values:
- `cronHour`/`cronMinute` → used to schedule the cron job (requires re-scheduling when changed, or check settings each run).
- `defaultHydroReminder1/2`, `defaultVisualReminder1/2` → used as fallback when a user hasn't customized their reminder days (note: users already have per-user overrides, so these defaults only apply to new user creation).

**Practical approach**: Rather than dynamically re-scheduling `node-cron`, run the cron at a fixed short interval (e.g., every minute) and check inside the handler whether the current UTC time matches `cronHour:cronMinute`. This avoids complexity around re-scheduling.

### Cylinder Model

Replace the hardcoded `3000` default service pressure with `getSettings().defaultServicePressure` where new cylinders are created.

### FormConstants

`allowedServicePressures` replaces the hardcoded `[2640, 3000, 3442]` array. Components that reference this constant will need to receive the allowed pressures as props (from server-fetched settings) rather than importing a static constant.

## Files to Create

- `src/lib/models/setting/index.tsx` — Setting model
- `src/lib/settings.ts` — getSettings/updateSettings helpers
- `src/app/settings/layout.tsx` — sidebar layout (client component)
- `src/components/Settings/InspectionTab.tsx` — client component
- `src/components/Settings/CylindersTab.tsx` — client component
- `src/components/Settings/NotificationsTab.tsx` — server component
- `src/components/Settings/SendTestEmailButton.tsx` — client island
- `src/app/api/settings/route.ts` — GET + PATCH
- `src/app/api/settings/test-email/route.ts` — POST
- `migrations/YYYYMMDDNNNNNN-create-settings.cjs` — migration
- `src/types/settings.ts` — AppSettings type

## Files to Modify

- `src/app/settings/page.tsx` — rewrite to tabbed layout with server-side data fetching per tab
- `src/lib/cron.ts` — read settings instead of hardcoded values
- `src/app/constants/FormConstants.ts` — remove hardcoded service pressures (or keep as fallback)
- `src/lib/models/config.tsx` — register Setting model
