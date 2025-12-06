'use client'

import { store } from '@/redux/store'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { ReactNode } from 'react'
import { Provider } from 'react-redux'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'

const Providers = ({ children }: { children: ReactNode }) => {
	return (
		<Provider store={store}>
			<LocalizationProvider dateAdapter={AdapterDayjs}>
				{children}
			</LocalizationProvider>
		</Provider>
	)
}

export default Providers
