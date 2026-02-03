'use client'

import { store } from '@/redux/store'
import { ReactNode } from 'react'
import { Provider } from 'react-redux'
import ModalProvider from '../Providers/ModalProvider'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

const Providers = ({ children }: { children: ReactNode }) => {
	return (
		<Provider store={store}>
			<QueryClientProvider client={queryClient}>
				<ModalProvider>{children}</ModalProvider>
			</QueryClientProvider>
		</Provider>
	)
}

export default Providers
