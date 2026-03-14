# Role-Based Access Control (RBAC) Design

## Overview

Implement granular role-based permissions across all API endpoints and pages. Four roles with escalating access: `user`, `filler`, `inspector`, `admin`. Includes data scoping for the `user` role, a dedicated customer dashboard, and an audit trail for admin/mutation actions.

## Roles

- **user** — Customer. Read-only access to their own linked client's data via a dedicated dashboard. Can edit own profile and account settings.
- **filler** — Shop operator. Full CRUD on clients, cylinders, fills, and maintenance. Can view but not create visual inspections. No delete access.
- **inspector** — Senior operator. Same as filler plus can create visual inspections. No delete access.
- **admin** — Full unrestricted access including delete operations, user management, and admin settings. All mutations are audit-logged.

## Permissions Table

| Capability | user | filler | inspector | admin |
|---|---|---|---|---|
| Own profile (view/edit) | Y | Y | Y | Y |
| Account settings (theme) | Y | Y | Y | Y |
| Dashboard (own data) | Y | Y | Y | Y |
| Clients (view) | - | Y | Y | Y |
| Clients (create/edit) | - | Y | Y | Y |
| Clients (delete) | - | - | - | Y |
| Cylinders (view) | - | Y | Y | Y |
| Cylinders (create/edit) | - | Y | Y | Y |
| Cylinders (delete) | - | - | - | Y |
| Fills (view) | - | Y | Y | Y |
| Fills (create) | - | Y | Y | Y |
| Fills (delete) | - | - | - | Y |
| Visual inspections (view) | - | Y | Y | Y |
| Visual inspections (create) | - | - | Y | Y |
| Visual inspections (delete) | - | - | - | Y |
| Maintenance (view/create) | - | Y | Y | Y |
| Maintenance (delete) | - | - | - | Y |
| History (all data) | - | Y | Y | Y |
| User management | - | - | - | Y |
| Admin settings | - | - | - | Y |

Note: Fills are immutable records — there is no edit (PUT) operation on fills.

## Architecture

### Centralized Permissions Config (`src/lib/permissions.ts`)

Single source of truth for all access rules, consumed by middleware, API routes, and navbar.

```typescript
PERMISSIONS = {
  // Public pages (no auth required) — not in this config, handled by proxy.ts publicPages
  // Public pages: '/', '/about', '/contact'

  pages: {
    '/dashboard':  ['user', 'filler', 'inspector', 'admin'],
    '/profile':    ['user', 'filler', 'inspector', 'admin'],
    '/fills':      ['filler', 'inspector', 'admin'],
    '/visual':     ['filler', 'inspector', 'admin'],
    '/clients':    ['filler', 'inspector', 'admin'],
    '/history':    ['filler', 'inspector', 'admin'],
    '/settings':   ['admin'],
  },

  api: {
    '/api/fills':                          { GET: ['filler', 'inspector', 'admin'], POST: ['filler', 'inspector', 'admin'], DELETE: ['admin'] },
    '/api/clients':                        { GET: ['filler', 'inspector', 'admin'], POST: ['filler', 'inspector', 'admin'] },
    '/api/clients/:clientId':              { GET: ['filler', 'inspector', 'admin'], PUT: ['filler', 'inspector', 'admin'], DELETE: ['admin'] },
    '/api/clients/:clientId/cylinders':    { GET: ['filler', 'inspector', 'admin'], POST: ['filler', 'inspector', 'admin'] },
    '/api/cylinders':                      { GET: ['filler', 'inspector', 'admin'], POST: ['filler', 'inspector', 'admin'] },
    '/api/cylinders/:cylinderId':          { PUT: ['filler', 'inspector', 'admin'], DELETE: ['admin'] },
    '/api/cylinders/:cylinderId/fills':    { GET: ['filler', 'inspector', 'admin'], POST: ['filler', 'inspector', 'admin'] },
    '/api/cylinders/:cylinderId/visuals':  { GET: ['filler', 'inspector', 'admin'], POST: ['inspector', 'admin'], DELETE: ['admin'] },
    '/api/visuals':                        { GET: ['filler', 'inspector', 'admin'] },
    '/api/inspectors':                     { GET: ['filler', 'inspector', 'admin'] },
    '/api/maintenance':                    { GET: ['filler', 'inspector', 'admin'], POST: ['filler', 'inspector', 'admin'], DELETE: ['admin'] },
    '/api/maintenance/last':               { GET: ['filler', 'inspector', 'admin'] },
    '/api/users':                          { GET: ['admin'] },
    '/api/users/:userId':                  { PUT: ['admin'] },
    '/api/profile':                        { PUT: ['user', 'filler', 'inspector', 'admin'] },
    '/api/contact':                        { GET: ['admin'] },
  }
}
```

#### Route Matching Strategy

The middleware uses **pattern matching with dynamic segments**. Route patterns use `:param` syntax (e.g., `/api/clients/:clientId`). The middleware strips actual IDs from the request path and matches against these patterns. Matching uses longest-prefix-first ordering so `/api/maintenance/last` takes priority over a hypothetical `/api/maintenance/:id`.

#### Unmatched Route Behavior

Routes not in the permissions config are handled as follows:

- **Public routes** (`/`, `/about`, `/contact`, `/api/auth/*`, `/api/contact` POST): bypass permission checks entirely. These are defined in a `publicRoutes` list in `proxy.ts`, extending the existing `publicPages` array. The `/contact` page must be added to `publicPages` as it is currently missing.
- **Dev-only routes** (`/api/seed`): bypass permission checks. Guarded internally by `NODE_ENV === 'development'` check.
- **Catch-all** (`/api/[...not_found]`): the middleware allows unmatched API routes to fall through to the catch-all handler, which returns 404. No permission check needed since no data is exposed.
- **Any other unmatched API route**: returns 403 (deny by default). This ensures new routes cannot accidentally be left unprotected.
- **Any other unmatched page route**: Next.js handles this with its built-in 404 page.

#### `/api/contact` Special Handling

The contact route has mixed access: POST is public (contact form submissions), GET requires auth (viewing submissions, admin-only). This is handled by adding `/api/contact` POST to the public routes list, and adding a permissions config entry for GET:

```typescript
'/api/contact': { GET: ['admin'] },
```

### Middleware (`proxy.ts`)

Extended to read the permissions config:
- Public routes: defined in `publicRoutes` list — bypass all permission checks. Includes `/`, `/about`, `/contact`, `/api/auth/*`, `/api/contact` POST, `/api/seed` (dev only).
- Page routes: look up path in `PERMISSIONS.pages`. If user's role not listed, redirect to `/`.
- API routes: normalize the request path to a pattern (replace dynamic segments with `:param`), look up the pattern and HTTP method in `PERMISSIONS.api`. If unauthorized or unmatched, return 403 JSON.

### `requireRole(session, roles)` Helper

Defense-in-depth check used inside API route handlers. Returns a 403 `Response` if unauthorized, or `null` if OK.

```typescript
const check = requireRole(session, ['filler', 'inspector', 'admin'])
if (check) return check
```

### Navigation Filtering

Navbar reads `PERMISSIONS.pages` and filters visible links based on the current user's role. The role is available client-side via `useSession()` — the existing session callback in `src/auth.ts` already propagates `role` to the session object.

Navigation by role:
- `user`: Profile, Dashboard
- `filler`: Dashboard, Fills, Visual (view only), History, Clients
- `inspector`: Dashboard, Fills, Visual, History, Clients
- `admin`: Everything including Settings

## Data Scoping

### `scopeQuery(user, entity, queryOptions)` Helper

Located in `src/lib/permissions.ts`. Conditionally adds client filtering for the `user` role.

Entity relationship map (internal to the helper). Note: the Cylinder model uses `ownerId` as its FK to Client, not `clientId`.

| Scope type | Entities | Filter strategy |
|---|---|---|
| direct (Client) | Client | `WHERE id = ?` (user's clientId) |
| direct (Cylinder) | Cylinder | `WHERE ownerId = ?` (user's clientId) |
| indirect | Fill, Visual | `INCLUDE Cylinder WHERE cylinder.ownerId = ?` (user's clientId) |
| none | Maintenance | No client relationship (not accessible to user role) |

Behavior by role:
- `user` with `clientId`: applies appropriate filter based on entity type
- `user` without `clientId`: returns 403 Response with message "No linked client. Contact the shop to link your account."
- `filler`, `inspector`, `admin`: returns `queryOptions` unchanged

The `scopeQuery` helper accepts the full database user object (from `User.findByPk`), not the session user. This is because `clientId` is not propagated to the session — only `role` is. API routes that use `scopeQuery` must perform a `User.findByPk(session.user.id)` lookup to access `clientId`. This is intentional: `clientId` is only needed for data-scoped queries (primarily the `user` role and dashboard), not for every request.

Usage in API routes:

```typescript
const dbUser = await User.findByPk(session.user.id)
const options = scopeQuery(dbUser, 'fill', { order: [['date', 'DESC']] })
if (options instanceof Response) return options
const fills = await Fill.findAll(options)
```

## Dashboard Page (`/dashboard`)

A server component accessible to all roles at `/dashboard`. The dashboard fetches data server-side using Sequelize queries directly (not via API routes), applying `scopeQuery` for data scoping.

- For `user` role: shows their linked client's cylinders, recent fills, and recent visuals — all scoped via `scopeQuery`
- For `filler`/`inspector`/`admin`: shows their linked client's data if they have one, otherwise a summary or prompt
- For `user` without linked client: inline message "No linked client. Contact the shop to link your account." (not a redirect)

Components in `src/components/Dashboard/`:
- Cylinders list
- Recent fills table
- Recent visuals table
- No-client message

## Audit Trail

### AuditLog Model (`src/lib/models/audit/index.tsx`)

Fields:
- `id` — primary key (UUID)
- `userId` — FK to User (who performed the action)
- `action` — `'create' | 'update' | 'delete'`
- `entity` — `'client' | 'cylinder' | 'fill' | 'visual' | 'maintenance' | 'user'`
- `entityId` — ID of the affected record (string to handle both UUID and integer IDs)
- `details` — JSON field with before/after values for updates, or created/deleted record data
- `createdAt` — timestamp

Note: the `.tsx` extension matches the existing project convention for model files.

### `auditLog(user, action, entity, entityId, details)` Helper

Located in `src/lib/audit.ts`. Async, non-blocking — if the audit write fails, logs the error but does not fail the original request.

### Audit Scope

Logged actions:
- All delete operations (admin only)
- All user management changes (role/client assignment)
- All create operations on fills and visuals (operational records)

Not logged:
- Profile edits, theme changes
- Read operations

### Viewing Audit Logs

Admin-only section on the settings page showing recent audit entries in a chronological table. No filtering or search in the initial version.

## Edge Cases

### Admin self-demotion

An admin must not be allowed to change their own role to a non-admin value if they are the only admin. The `/api/users/:userId` PUT handler should check: if the target user is the requesting user and the new role is not `admin`, query for the count of remaining admins. If count would drop to zero, return 400 with "Cannot remove the last admin."

## Files

### New files
- `src/lib/permissions.ts` — permissions config, `requireRole()`, `scopeQuery()`, nav filter helper
- `src/lib/models/audit/index.tsx` — AuditLog Sequelize model
- `src/lib/audit.ts` — `auditLog()` helper function
- `src/app/dashboard/page.tsx` — dashboard page (server component)
- `src/components/Dashboard/` — dashboard UI components
- `src/app/api/users/route.tsx` — GET handler for listing users (admin only)

### Modified files
- `src/proxy.ts` — extend middleware with role-based page/API access checks using pattern matching
- `src/types/next-auth.d.ts` — tighten role type to `'user' | 'admin' | 'filler' | 'inspector'`
- `src/components/Layout/Navbar.tsx` — filter nav links by role using permissions config
- `src/app/api/clients/route.tsx` — add `requireRole()`
- `src/app/api/clients/[clientId]/route.tsx` — add `requireRole()`, DELETE handler, `auditLog()`
- `src/app/api/clients/[clientId]/cylinders/route.tsx` — add `requireRole()`
- `src/app/api/cylinders/route.tsx` — add `requireRole()`
- `src/app/api/cylinders/[cylinderId]/route.tsx` — add `requireRole()`, DELETE handler, `auditLog()`
- `src/app/api/cylinders/[cylinderId]/fills/route.tsx` — add `requireRole()`
- `src/app/api/cylinders/[cylinderId]/visuals/route.tsx` — add `requireRole()`, restrict POST to inspector/admin, `auditLog()`
- `src/app/api/fills/route.tsx` — add `requireRole()`, DELETE handler, `auditLog()`
- `src/app/api/visuals/route.tsx` — add `requireRole()`
- `src/app/api/inspectors/route.tsx` — add `requireRole()`
- `src/app/api/maintenance/route.tsx` — add `requireRole()`, DELETE handler, `auditLog()`
- `src/app/api/maintenance/last/route.tsx` — add `requireRole()`
- `src/app/api/users/[userId]/route.tsx` — add `auditLog()`, add admin self-demotion guard
- `src/app/settings/page.tsx` — add audit log table section, use new GET `/api/users` route

### Unchanged
- `src/app/api/profile/route.tsx` — already correct (self only, role update blocked)
- `src/app/api/contact/route.tsx` — POST stays public (in publicRoutes), GET restricted to admin via permissions config
- `src/app/api/seed/route.tsx` — dev-only, bypasses permission checks, self-guards with NODE_ENV check
- `src/app/api/auth/[...nextauth]/route.ts` — public auth routes, bypassed by publicRoutes
- `src/app/api/[...not_found]/route.tsx` — catch-all 404, unmatched routes fall through to this
