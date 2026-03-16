# Email Notifications

## Problem

Users have no way to receive email notifications about events relevant to them — contact form submissions, new account creation, or upcoming equipment maintenance deadlines (hydro tests, visual inspections).

## Solution

Add email notification support using nodemailer with SMTP configuration via environment variables. Two categories of notifications:

- **Interactive**: contact form submission (to admins + shop email), welcome email (to new users)
- **Scheduled**: hydro due reminders, visual due reminders (daily cron check via node-cron)

Users can opt in/out of each notification type and configure reminder windows from their profile page.

## User Model Changes

New fields on the User model with defaults:

| Field | Type | Default | Purpose |
|-------|------|---------|---------|
| `notifyContact` | BOOLEAN | `true` | Opt-out toggle for contact form emails (only queried for admin users) |
| `notifyHydro` | BOOLEAN | `true` | Hydro due reminders |
| `notifyVisual` | BOOLEAN | `true` | Visual due reminders |
| `hydroReminderDays1` | INTEGER | `180` | First hydro reminder (days before due) |
| `hydroReminderDays2` | INTEGER | `30` | Second hydro reminder (days before due) |
| `visualReminderDays1` | INTEGER | `60` | First visual reminder (days before due) |
| `visualReminderDays2` | INTEGER | `30` | Second visual reminder (days before due) |

## Email Infrastructure

### Transport

Shared nodemailer singleton in `src/lib/email/transport.ts`. Configured via nconf environment variables (double-underscore nesting):

- `SMTP__HOST` — SMTP server hostname
- `SMTP__PORT` — SMTP port (default 587)
- `SMTP__USER` — SMTP username
- `SMTP__PASSWORD` — SMTP password
- `SMTP__FROM` — Sender address (e.g., `noreply@fillstation.example`)
- `SMTP__SHOP_EMAIL` — Shop contact email for receiving contact form notifications

Note: nconf uses `lowerCase: true`, so env vars are accessed as `nconf.get('smtp:host')`, `nconf.get('smtp:port')`, etc.

Exports `sendEmail(to, subject, html)`. If SMTP is not configured, logs a warning and skips sending (graceful degradation for dev environments).

### Templates

Simple functions in `src/lib/email/templates.ts` returning HTML strings with inline styles. No template engine dependency.

- `welcomeEmail(userName)` — "Welcome to Fill Station"
- `contactNotificationEmail(contactName, contactEmail, message)` — "New contact form submission"
- `hydroReminderEmail(userName, cylinderSerial, dueDate)` — "Hydro due soon"
- `visualReminderEmail(userName, cylinderSerial, dueDate)` — "Visual inspection due soon"

## Interactive Notifications

### Contact form submission

In `src/app/api/contact/route.tsx` POST handler, after saving the contact record:

1. Query all users with `role` in `['admin']` and `notifyContact = true`
2. Send each the `contactNotificationEmail`
3. Also send to `SMTP__SHOP_EMAIL` if configured
4. Fire-and-forget — don't block the API response. Log errors but don't fail the request.

### New account creation

In `src/auth.ts`, add a `createUser` event handler (NextAuth fires this when a user is first created via OAuth):

1. If the new user has an email, send `welcomeEmail`
2. Always sent on first creation — no opt-out (the welcome email is a one-time event)
3. Fire-and-forget pattern

## Scheduled Notifications

### Cron job

`node-cron` running a daily check at 8:00 AM (UTC — container default) inside the Next.js process. Defined in `src/lib/cron.ts`, initialized from `src/instrumentation.ts` via the `register()` export so it starts once on server boot. Include a module-level guard to prevent multiple schedulers in dev mode (Next.js may call `register()` more than once).

### Daily check logic

1. Query all cylinders joined via `Cylinder.ownerId → Client.id ← User.clientId` where the user has an email. Multiple users may be linked to the same client — each gets their own reminder.
2. For each cylinder, calculate:
   - `nextHydro = lastHydro + 5 years`
   - `nextVis = lastVis + 1 year`
3. For users with `notifyHydro = true`: if today is exactly `nextHydro - hydroReminderDays1` or `nextHydro - hydroReminderDays2` days away, send `hydroReminderEmail`
4. Same for visual reminders with `notifyVisual`, `visualReminderDays1`, `visualReminderDays2`

### Deduplication

A `NotificationLog` model prevents duplicate sends (e.g., app restart mid-day):

| Field | Type | Purpose |
|-------|------|---------|
| `id` | INTEGER (PK) | Auto-increment |
| `userId` | UUID (FK) | Recipient |
| `type` | ENUM('hydro_reminder', 'visual_reminder') | Notification type |
| `cylinderId` | INTEGER (FK) | Which cylinder |
| `reminderDays` | INTEGER | Which reminder window (e.g., 180 or 30) |
| `sentAt` | DATEONLY | Date sent (no time component) |

Composite index on `(userId, type, cylinderId, reminderDays, sentAt)` for efficient deduplication lookups.

Before sending a scheduled reminder, check if a matching log entry exists for today (`WHERE sentAt = CURDATE()`). Only insert the log entry after a successful send. Provides admin visibility into what was sent.

If the SMTP server is unreachable during the cron run, log the error and skip — the reminder will be retried on the next daily run since no log entry was written. Emails are sent sequentially to avoid overwhelming the SMTP server.

## User Preferences UI

Add a "Notification Preferences" section to the existing profile page (`src/components/Profile/ProfileForm.tsx`):

- Toggle switches for notification types: contact (shown only for admins), hydro, visual
- Number inputs for reminder day offsets (hydro 1st/2nd, visual 1st/2nd) — shown only when the corresponding toggle is on
- Saved via the existing PUT `/api/profile` endpoint, extended to accept the notification fields
- The existing validation in the PUT handler must be updated to recognize notification fields as valid update targets

## Files Changed

| File | Action | Purpose |
|------|--------|---------|
| `src/lib/email/transport.ts` | Create | Nodemailer singleton + `sendEmail` function |
| `src/lib/email/templates.ts` | Create | HTML template functions for each email type |
| `src/lib/cron.ts` | Create | node-cron daily job for scheduled reminders |
| `src/lib/models/notificationLog/index.tsx` | Create | NotificationLog model for deduplication |
| `src/lib/models/user/index.tsx` | Modify | Add 7 notification preference fields |
| `src/auth.ts` | Modify | Send welcome email on createUser event |
| `src/app/api/contact/route.tsx` | Modify | Send email to admins + shop on form submit |
| `src/app/api/profile/route.tsx` | Modify | Accept notification preference fields, update validation |
| `src/types/profile.ts` | Modify | Add notification preference fields to Profile type |
| `src/components/Profile/ProfileForm.tsx` | Modify | Add notification preferences UI |
| `src/instrumentation.ts` | Create | Register cron scheduler on server boot |
| `migrations/20241101000010-add-user-notification-prefs.cjs` | Create | Add preference columns to users table |
| `migrations/20241101000011-create-notification-log.cjs` | Create | Create notification_logs table |
