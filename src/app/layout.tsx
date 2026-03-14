import Copyright from '@/components/Layout/Copyright'
import './global.css'
import Navbar from '@/components/Layout/Navbar'
import Providers from '@/components/Layout/Providers'
import { ReactNode } from 'react'

import { Metadata } from 'next'
import { Slide, ToastContainer } from 'react-toastify'
import { auth } from '@/auth'
import { User } from '@/lib/models/user'
import { Theme } from '@/types/profile'

export const metadata: Metadata = {
	title: {
		template: '%s | Fill Station',
		default: 'Dive Tec Fill Station',
	},
	applicationName: 'Fill Station',
	authors: [{ name: 'Marshall Asch' }, { name: 'Kellen Wiltshire' }],
	keywords: [
		'scuba diving',
		'scuba',
		'dive shop',
		'fill station',
		'compressor',
	],
	description: 'Fill station and Service tracker for small dive shops',
}

export default async function Layout({ children }: { children: ReactNode }) {
	let theme: Theme = 'system'
	const session = await auth()
	if (session?.user?.id) {
		const dbUser = await User.findByPk(session.user.id)
		if (dbUser) {
			theme = dbUser.theme
		}
	}

	return (
		<Providers initialTheme={theme}>
			<html lang='en'>
				<body className='bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100'>
					<Navbar />
					<main className='font-montserrat-regular flex min-h-screen justify-center'>
						{children}

						<ToastContainer
							position='bottom-left'
							autoClose={5000}
							hideProgressBar={false}
							newestOnTop={false}
							closeOnClick
							rtl={false}
							pauseOnFocusLoss
							draggable
							pauseOnHover
							theme='colored'
							transition={Slide}
						/>
					</main>
					<Copyright />
				</body>
			</html>
		</Providers>
	)
}
