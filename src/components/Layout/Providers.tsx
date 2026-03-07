'use client'

import { store } from '@/redux/store'
import { ReactNode } from 'react'
import { Provider } from 'react-redux'
import ModalProvider from '../Providers/ModalProvider'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SessionProvider } from 'next-auth/react'

const queryClient = new QueryClient()

const Providers = ({ children }: { children: ReactNode }) => {
	return (
		<Provider store={store}>
			<SessionProvider>
				<QueryClientProvider client={queryClient}>
					<ModalProvider>{children}</ModalProvider>
				</QueryClientProvider>
			</SessionProvider>
		</Provider>
	)
}

export default Providers
