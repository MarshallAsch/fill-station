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
