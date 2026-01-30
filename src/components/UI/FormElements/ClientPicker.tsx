'use client'

import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import {
	Button,
	Combobox,
	ComboboxButton,
	ComboboxInput,
	ComboboxOption,
	ComboboxOptions,
	Label,
} from '@headlessui/react'
import { useState } from 'react'
import { ChevronDownIcon } from '@heroicons/react/24/outline'
import { Client, selectClient } from '@/redux/client/clientSlice'
import { updateAddClientModalOpen } from '@/redux/modal/modalSlice'

const ClientPicker = () => {
	const { allClients: clients } = useAppSelector((state) => state.clients)
	const dispatch = useAppDispatch()

	const [query, setQuery] = useState('')
	const [selectedClient, setSelectedClient] = useState<Client | null>(null)

	const filteredClients =
		query === ''
			? clients
			: clients.filter((person) => {
					return person.name.toLowerCase().includes(query.toLowerCase())
				})

	return (
		<Combobox
			as='div'
			value={selectedClient}
			onChange={(client) => {
				setQuery('')
				if (client) {
					setSelectedClient(client)
					dispatch(selectClient(client?.id))
				}
			}}
		>
			<Label className='block text-sm/6 font-medium text-gray-900'>
				Select a Client
			</Label>

			<div className='relative mt-2'>
				<ComboboxInput
					className='block w-full rounded-md bg-white py-1.5 pr-12 pl-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6'
					name='client'
					onChange={(e) => setQuery(e.target.value)}
					displayValue={(client: Client) => client && client.name}
				/>

				<ComboboxButton className='absolute inset-y-0 right-0 flex cursor-pointer items-center rounded-r-md px-2 focus:outline-hidden'>
					<ChevronDownIcon
						className='h-5 w-5 text-gray-400'
						aria-hidden='true'
					/>
				</ComboboxButton>

				<ComboboxOptions
					transition
					className='absolute z-10 mt-1 max-h-60 w-75 overflow-auto rounded-md bg-white py-1 text-base shadow-lg outline outline-black/5 data-leave:transition data-leave:duration-100 data-leave:ease-in data-closed:data-leave:opacity-0 sm:text-sm'
				>
					<Button
						onClick={() => dispatch(updateAddClientModalOpen(true))}
						className='cursor-pointer px-3 py-2 text-gray-900 select-none data-focus:bg-indigo-600 data-focus:text-white data-focus:outline-hidden'
					>
						Add new Client
					</Button>
					{query.length > 0 && (
						<ComboboxOption
							value={{ id: null, name: query }}
							className='cursor-pointer px-3 py-2 text-gray-900 select-none data-focus:bg-indigo-600 data-focus:text-white data-focus:outline-hidden'
						>
							{query}
						</ComboboxOption>
					)}
					{filteredClients.map((client) => (
						<ComboboxOption
							key={client.id}
							value={client}
							className='cursor-pointer px-3 py-2 text-gray-900 select-none data-focus:bg-indigo-600 data-focus:text-white data-focus:outline-hidden'
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
