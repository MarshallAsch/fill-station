'use client'

import { store } from '@/redux/store'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { ReactNode } from 'react'
import { Provider } from 'react-redux'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import ModalProvider from '../Providers/ModalProvider'

const Providers = ({ children }: { children: ReactNode }) => {
	return (
		<Provider store={store}>
			<LocalizationProvider dateAdapter={AdapterDayjs}>
				<ModalProvider>{children}</ModalProvider>
			</LocalizationProvider>
		</Provider>
	)
}

export default Providers
