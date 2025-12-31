import Copyright from '@/components/Layout/Copyright'
import './global.css'
import Navbar from '@/components/Layout/Navbar'
import Providers from '@/components/Layout/Providers'
import { ReactNode } from 'react'

export default function Layout({ children }: { children: ReactNode }) {
	return (
		<Providers>
			<html lang='en'>
				<body>
					<Navbar />
					<main className='font-montserrat-regular flex min-h-screen justify-center'>
						{children}
					</main>
					<Copyright />
				</body>
			</html>
		</Providers>
	)
}
