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
	disabled?: boolean
	value?: Client | null
	onChange?: (client: Client | null) => void
}

const ClientPicker = ({
	disableAdd,
	disabled = false,
	value,
	onChange,
}: ClientPickerProps) => {
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
			disabled={disabled}
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
			<Label className='text-text block text-sm/6 font-medium'>
				Select a Client
			</Label>

			<div className='relative mt-2'>
				<ComboboxInput
					className='bg-background text-text outline-ring placeholder:text-muted-text focus:outline-accent block w-full rounded-md py-1.5 pr-12 pl-3 text-base outline-1 -outline-offset-1 focus:outline-2 focus:-outline-offset-2 sm:text-sm/6'
					name='client'
					onChange={(e) => setQuery(e.target.value)}
					displayValue={(client: Client) => client && client.name}
				/>

				<ComboboxButton className='absolute inset-y-0 right-0 flex cursor-pointer items-center rounded-r-md px-2 focus:outline-hidden'>
					<ChevronDownIcon
						className='text-muted-text h-5 w-5'
						aria-hidden='true'
					/>
				</ComboboxButton>

				<ComboboxOptions
					transition
					className='bg-background absolute z-10 mt-1 max-h-60 w-75 overflow-auto rounded-md py-1 text-base shadow-lg outline outline-black/5 data-leave:transition data-leave:duration-100 data-leave:ease-in data-closed:data-leave:opacity-0 sm:text-sm'
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
							className='text-text data-focus:bg-accent data-focus:text-white-text cursor-pointer px-3 py-2 select-none data-focus:outline-hidden'
						>
							{query}
						</ComboboxOption>
					)}
					{filteredClients.map((client) => (
						<ComboboxOption
							key={client.id}
							value={client}
							className='text-text data-focus:bg-accent data-focus:text-white-text cursor-pointer px-3 py-2 select-none data-focus:outline-hidden'
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
