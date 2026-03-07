'use client'
import { signIn, signOut, useSession } from 'next-auth/react'

type LoginProps = {}

const Login = ({}: LoginProps) => {
	const session = useSession()

	return (
		<>
			{session.status == 'authenticated' ? (
				<button
					type='button'
					onClick={() => signOut()}
					className='text-sm/6 font-semibold text-gray-900'
				>
					Logout
				</button>
			) : (
				<button
					type='button'
					onClick={() => signIn('authelia')}
					className='text-sm/6 font-semibold text-gray-900'
				>
					Log in <span aria-hidden='true'>&rarr;</span>
				</button>
			)}
		</>
	)
}

export default Login
