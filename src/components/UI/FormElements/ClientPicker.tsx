'use client'

import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import {
	Combobox,
	ComboboxButton,
	ComboboxInput,
	ComboboxOption,
	ComboboxOptions,
	Label,
} from '@headlessui/react'
import { useState } from 'react'
import { ChevronDownIcon } from '@heroicons/react/24/outline'
import { updateAddClientModalOpen } from '@/redux/modal/modalSlice'
import { Client } from '@/types/client'
import Button from '../Button'
import { setSelectedClient } from '@/redux/client/clientSlice'
import useLoadClients from '@/hooks/useLoadClients'

type ClientPickerProps = {
	disableAdd?: boolean
	value?: Client | null
	onChange?: (client: Client | null) => void
}

const ClientPicker = ({ disableAdd, value, onChange }: ClientPickerProps) => {
	const { clients } = useLoadClients()
	const dispatch = useAppDispatch()
	const [query, setQuery] = useState('')

	const { selectedClient } = useAppSelector((state) => state.clients)

	const isControlled = onChange !== undefined
	const currentValue = isControlled ? value : selectedClient

	const filteredClients =
		query === ''
			? clients
			: clients.filter((person) => {
					return person.name.toLowerCase().includes(query.toLowerCase())
				})

	return (
		<Combobox
			as='div'
			value={currentValue}
			onChange={(client) => {
				setQuery('')
				if (isControlled) {
					onChange(client)
				} else if (client) {
					dispatch(setSelectedClient(client))
				}
			}}
			className='w-1/2'
		>
			<Label className='block text-sm/6 font-medium text-gray-900 dark:text-gray-100'>
				Select a Client
			</Label>

			<div className='relative mt-2'>
				<ComboboxInput
					className='block w-full rounded-md bg-white py-1.5 pr-12 pl-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 dark:bg-gray-800 dark:text-gray-100 dark:outline-gray-600 dark:placeholder:text-gray-500'
					name='client'
					onChange={(e) => setQuery(e.target.value)}
					displayValue={(client: Client) => client && client.name}
				/>

				<ComboboxButton className='absolute inset-y-0 right-0 flex cursor-pointer items-center rounded-r-md px-2 focus:outline-hidden'>
					<ChevronDownIcon
						className='h-5 w-5 text-gray-400 dark:text-gray-500'
						aria-hidden='true'
					/>
				</ComboboxButton>

				<ComboboxOptions
					transition
					className='absolute z-10 mt-1 max-h-60 w-75 overflow-auto rounded-md bg-white py-1 text-base shadow-lg outline outline-black/5 data-leave:transition data-leave:duration-100 data-leave:ease-in data-closed:data-leave:opacity-0 sm:text-sm dark:bg-gray-800 dark:outline-gray-700'
				>
					<div className='m-2 w-40'>
						<Button
							onClick={() => dispatch(updateAddClientModalOpen(true))}
							disabled={disableAdd}
						>
							Add new Client
						</Button>
					</div>
					{query.length > 0 && (
						<ComboboxOption
							value={{ id: null, name: query }}
							hidden={disableAdd}
							disabled={true}
							className='cursor-pointer px-3 py-2 text-gray-900 select-none data-focus:bg-indigo-600 data-focus:text-white data-focus:outline-hidden dark:text-gray-100'
						>
							{query}
						</ComboboxOption>
					)}
					{filteredClients.map((client) => (
						<ComboboxOption
							key={client.id}
							value={client}
							className='cursor-pointer px-3 py-2 text-gray-900 select-none data-focus:bg-indigo-600 data-focus:text-white data-focus:outline-hidden dark:text-gray-100'
						>
							{client.name}
						</ComboboxOption>
					))}
				</ComboboxOptions>
			</div>
		</Combobox>
	)
}

export default ClientPicker
