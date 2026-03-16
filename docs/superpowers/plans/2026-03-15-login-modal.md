# Login Provider Modal Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the default NextAuth sign-in redirect with an in-app modal showing available login providers.

**Architecture:** A Headless UI Dialog modal (`LoginModal`) rendered by the existing `Login` component. The home page triggers the modal via a custom DOM event when users are redirected from protected routes.

**Tech Stack:** Next.js 16, React 19, Headless UI (Dialog/Transition), NextAuth v5, Tailwind CSS v4

**Spec:** `docs/superpowers/specs/2026-03-15-login-modal-design.md`

---

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `src/components/Modals/LoginModal.tsx` | Create | Modal dialog with provider sign-in buttons |
| `src/components/UI/Login.tsx` | Modify | Modal state management + custom event listener |
| `src/app/page.tsx` | Modify | Dispatch open event on redirect, strip query param |

---

## Task 1: Create LoginModal component

**Files:**
- Create: `src/components/Modals/LoginModal.tsx`
- Reference: `src/components/Modals/ClientModal.tsx` (for Transition/Dialog pattern)

- [ ] **Step 1: Create LoginModal component**

```tsx
'use client'

import {
	Dialog,
	DialogPanel,
	DialogTitle,
	Transition,
	TransitionChild,
} from '@headlessui/react'
import { Fragment } from 'react'
import { signIn } from 'next-auth/react'
import Button from '../UI/Button'

type LoginModalProps = {
	open: boolean
	onClose: () => void
}

// Provider list must stay in sync with src/auth.ts
const providers = [
	{ id: 'google', name: 'Google' },
	{ id: 'authelia', name: 'Marshalls Lab' },
]

const LoginModal = ({ open, onClose }: LoginModalProps) => {
	return (
		<Transition show={open} as={Fragment}>
			<Dialog as='div' onClose={onClose} className='relative z-50'>
				<TransitionChild
					as={Fragment}
					enter='ease-out duration-300'
					enterFrom='opacity-0'
					enterTo='opacity-100'
					leave='ease-in duration-200'
					leaveFrom='opacity-100'
					leaveTo='opacity-0'
				>
					<div className='bg-overlay fixed inset-0 transition-opacity' />
				</TransitionChild>
				<div className='fixed inset-0 z-50 overflow-y-auto'>
					<div className='flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0'>
						<TransitionChild
							as={Fragment}
							enter='ease-out duration-300'
							enterFrom='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
							enterTo='opacity-100 translate-y-0 sm:scale-100'
							leave='ease-in duration-200'
							leaveFrom='opacity-100 translate-y-0 sm:scale-100'
							leaveTo='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
						>
							<DialogPanel className='bg-background relative transform overflow-hidden rounded-lg px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6'>
								<DialogTitle className='text-text text-center text-lg font-semibold'>
									Sign in to Fill Station
								</DialogTitle>
								<div className='mt-6 flex flex-col gap-3'>
									{providers.map((provider) => (
										<Button
											key={provider.id}
											onClick={() => signIn(provider.id)}
											className='w-full justify-center'
										>
											Sign in with {provider.name}
										</Button>
									))}
								</div>
							</DialogPanel>
						</TransitionChild>
					</div>
				</div>
			</Dialog>
		</Transition>
	)
}

export default LoginModal
```

- [ ] **Step 2: Verify it renders**

Run: `npm run build`
Expected: No build errors

- [ ] **Step 3: Commit**

```bash
git add src/components/Modals/LoginModal.tsx
git commit -m "feat: add LoginModal component with provider buttons"
```

---

## Task 2: Update Login component to use LoginModal

**Files:**
- Modify: `src/components/UI/Login.tsx`

- [ ] **Step 1: Replace signIn() call with modal state + event listener**

Replace the full contents of `src/components/UI/Login.tsx` with:

```tsx
'use client'

import { useSession } from 'next-auth/react'
import { useCallback, useEffect, useState } from 'react'
import ProfileButton from './ProfileButton'
import Button from './Button'
import LoginModal from '../Modals/LoginModal'

const Login = () => {
	const session = useSession()
	const [isOpen, setIsOpen] = useState(false)

	const openModal = useCallback(() => {
		if (session.status !== 'authenticated') {
			setIsOpen(true)
		}
	}, [session.status])

	useEffect(() => {
		window.addEventListener('open-login-modal', openModal)
		return () => {
			window.removeEventListener('open-login-modal', openModal)
		}
	}, [openModal])

	return (
		<>
			{session.status === 'authenticated' ? (
				<ProfileButton />
			) : (
				<Button
					type='button'
					onClick={() => setIsOpen(true)}
					className='text-text text-sm/6 font-semibold'
				>
					Log in <span aria-hidden='true'>&rarr;</span>
				</Button>
			)}
			<LoginModal open={isOpen} onClose={() => setIsOpen(false)} />
		</>
	)
}

export default Login
```

- [ ] **Step 2: Verify it builds**

Run: `npm run build`
Expected: No build errors

- [ ] **Step 3: Commit**

```bash
git add src/components/UI/Login.tsx
git commit -m "feat: wire Login component to LoginModal with event listener"
```

---

## Task 3: Update home page to trigger modal on redirect

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Replace toast with custom event dispatch + URL cleanup**

In `src/app/page.tsx`, replace the `useEffect` block that checks for `redirected` param:

Old code (lines 14-24):
```tsx
useEffect(() => {
	if (searchParams.get('redirected') === 'true') {
		toast.warning(
			'You need to be logged in to access that page. Please sign in first.',
			{
				position: 'bottom-left',
				autoClose: 5000,
			},
		)
	}
}, [searchParams])
```

New code:
```tsx
useEffect(() => {
	if (searchParams.get('redirected') === 'true') {
		setTimeout(() => {
			window.dispatchEvent(new Event('open-login-modal'))
		}, 0)
		window.history.replaceState(null, '', '/')
	}
}, [searchParams])
```

Also remove these unused imports (lines 7-8):
```diff
- import { toast } from 'react-toastify'
```

- [ ] **Step 2: Run lint**

Run: `npm run lint`
Expected: No new errors (unused toast import removed)

- [ ] **Step 3: Verify it builds**

Run: `npm run build`
Expected: No build errors

- [ ] **Step 4: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: trigger login modal on protected route redirect"
```

---

## Task 4: Manual verification

- [ ] **Step 1: Start dev server and verify manual "Log in" click**

Run: `npm run dev`
1. Navigate to `/` while not authenticated
2. Click "Log in" in the navbar
3. Verify modal appears with "Sign in to Fill Station" heading and two provider buttons
4. Click backdrop or press Escape — modal closes

- [ ] **Step 2: Verify redirect flow**

1. Navigate directly to `/dashboard` while not authenticated
2. Verify redirect to `/` and modal opens automatically
3. Verify URL bar shows `/` (no `?redirected=true`)

- [ ] **Step 3: Verify provider buttons work**

1. Open the modal
2. Click "Sign in with Google" — verify redirect to Google OAuth
3. Repeat with "Sign in with Marshalls Lab" — verify redirect to Authelia
