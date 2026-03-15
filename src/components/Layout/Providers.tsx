'use client'

import { store } from '@/redux/store'
import { ReactNode } from 'react'
import { Provider } from 'react-redux'
import ModalProvider from '../Providers/ModalProvider'
import ThemeProvider from '../Providers/ThemeProvider'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SessionProvider } from 'next-auth/react'
import { Theme } from '@/types/profile'

const queryClient = new QueryClient()

const Providers = ({
	children,
	initialTheme,
}: {
	children: ReactNode
	initialTheme: Theme
}) => {
	return (
		<Provider store={store}>
			<SessionProvider>
				<QueryClientProvider client={queryClient}>
					<ThemeProvider initialTheme={initialTheme}>
						<ModalProvider>{children}</ModalProvider>
					</ThemeProvider>
				</QueryClientProvider>
			</SessionProvider>
		</Provider>
	)
}

export default Providers
