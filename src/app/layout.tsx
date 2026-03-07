import Copyright from '@/components/Layout/Copyright'
import './global.css'
import Navbar from '@/components/Layout/Navbar'
import Providers from '@/components/Layout/Providers'
import { ReactNode } from 'react'

import { Metadata } from 'next'
import { Slide, ToastContainer } from 'react-toastify'

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

export default function Layout({ children }: { children: ReactNode }) {
	return (
		<Providers>
			<html lang='en'>
				<body>
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
