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
					className='text-text text-sm/6 font-semibold'
				>
					Log in <span aria-hidden='true'>&rarr;</span>
				</Button>
			)}
		</>
	)
}

export default Login
