'use client'
import { signIn, useSession } from 'next-auth/react'
import ProfileButton from './ProfileButton'
import Button from './Button'

type LoginProps = {}

const Login = ({}: LoginProps) => {
	const session = useSession()

	return (
		<>
			{session.status == 'authenticated' ? (
				<ProfileButton />
			) : (
				<Button
					type='button'
					onClick={() => signIn('authelia')}
					className='text-sm/6 font-semibold text-gray-900 dark:text-gray-100'
				>
					Log in <span aria-hidden='true'>&rarr;</span>
				</Button>
			)}
		</>
	)
}

export default Login
