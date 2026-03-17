# Login Provider Modal

## Problem

Clicking "Log in" calls `signIn()` with no arguments, which redirects to NextAuth's default unstyled provider selection page. Users should see an in-app modal with the available login options.

## Solution

A Headless UI Dialog modal showing the configured providers. Opens when the user clicks "Log in" or when redirected from a protected route.

## Components

### LoginModal (new)

- **File**: `src/components/Modals/LoginModal.tsx`
- Client component using Headless UI `Dialog` with `Transition`/`TransitionChild` wrappers matching the existing modal pattern (see `ClientModal.tsx`)
- Props: `open: boolean`, `onClose: () => void`
- Content:
  - Backdrop using `bg-overlay` theme token
  - Panel with `bg-background` card styling, rounded corners (matching existing modal pattern)
  - Heading: "Sign in to Fill Station"
  - Two provider buttons:
    - "Sign in with Google" → `signIn('google')`
    - "Sign in with Marshalls Lab" → `signIn('authelia')`
  - Buttons styled with the app's existing `Button` component or similar treatment
- Comment in component noting provider list must stay in sync with `src/auth.ts`

### Login (updated)

- **File**: `src/components/UI/Login.tsx`
- Adds `isOpen` state to control the modal
- Clicking "Log in" sets `isOpen = true`
- Renders `<LoginModal open={isOpen} onClose={() => setIsOpen(false)} />`
- Listens for `open-login-modal` custom event on `window` to allow external triggers
- **Guard**: event listener checks `session.status !== 'authenticated'` before opening — prevents modal from opening if user is already logged in (e.g., stale bookmark with `?redirected=true`)
- Cleans up event listener on unmount

### Home page (updated)

- **File**: `src/app/page.tsx`
- When `?redirected=true` is present, dispatches `window` custom event `open-login-modal` using `setTimeout(..., 0)` to ensure the Login component's listener is registered first (layout effects run before page effects in Next.js App Router, but the setTimeout guarantees ordering)
- After dispatching, strips `?redirected=true` from the URL via `window.history.replaceState` to prevent the modal from re-opening on page refresh
- Removes the existing toast notification (the modal replaces that UX)

## Auth Config

- **File**: `src/auth.ts`
- **Keep `pages: { signIn: '/' }` as-is.** This setting tells NextAuth where to redirect for its internal sign-in flows. Removing it would cause NextAuth to redirect to its default unstyled `/api/auth/signin` page in fallback scenarios, which is the problem we're solving. The proxy redirect flow (`proxy.ts` → `/?redirected=true`) is independent of this setting.

## Redirect Flow

```
Unauthenticated user hits protected route (e.g., /dashboard)
  → proxy.ts redirects to /?redirected=true
  → Home page useEffect fires setTimeout dispatching "open-login-modal" event
  → Home page strips ?redirected=true from URL
  → Login component listener checks auth status, opens LoginModal
  → User clicks provider button
  → signIn('google') or signIn('authelia') starts OAuth flow
  → OAuth callback → redirect back to app
```

## Provider List

Hardcoded in the modal. The two providers (Authelia, Google) are defined server-side in `auth.ts` and rarely change. Dynamically fetching them adds unnecessary complexity. A comment in the component notes the sync requirement.

## Files Changed

| File | Change |
|------|--------|
| `src/components/Modals/LoginModal.tsx` | New — modal with provider buttons |
| `src/components/UI/Login.tsx` | Add modal state + event listener |
| `src/app/page.tsx` | Replace toast with custom event dispatch + URL cleanup |
