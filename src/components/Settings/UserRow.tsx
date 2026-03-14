'use client'

import { Profile } from '@/types/profile'
import { Client } from '@/types/client'
import { ROLE_OPTIONS } from '@/app/constants/FormConstants'
import ListBox from '@/components/UI/FormElements/ListBox'
import ClientPicker from '@/components/UI/FormElements/ClientPicker'
import { updateUserRole, updateUserClient } from '@/app/_api'
import { toast } from 'react-toastify'
import { useState } from 'react'

const UserRow = ({ user }: { user: Profile }) => {
	const [selectedClient, setSelectedClient] = useState<Client | null>(
		user.clientId && user.clientName
			? ({ id: user.clientId, name: user.clientName } as Client)
			: null,
	)

	const defaultRole =
		ROLE_OPTIONS.find((r) => r.value === user.role) || ROLE_OPTIONS[0]

	const handleRoleChange = async (item: { value: string }) => {
		const result = await updateUserRole(user.id, item.value)
		if (typeof result === 'string') {
			toast.error(`Failed to update role: ${result}`)
		} else {
			toast.success(`Updated role for ${user.name ?? user.email}`)
		}
	}

	const handleClientChange = async (client: Client | null) => {
		setSelectedClient(client)
		const result = await updateUserClient(user.id, client?.id ?? null)
		if (typeof result === 'string') {
			toast.error(`Failed to update client: ${result}`)
		} else {
			toast.success(`Updated client for ${user.name ?? user.email}`)
		}
	}

	return (
		<tr className='hover:bg-gray-100 dark:hover:bg-gray-800'>
			<td className='py-4 pr-3 pl-4 text-center text-sm font-medium whitespace-nowrap text-gray-900 sm:pl-6 dark:text-gray-100'>
				{user.name ?? '—'}
			</td>
			<td className='px-3 py-4 text-center text-sm whitespace-nowrap text-gray-500 dark:text-gray-400'>
				{user.email ?? '—'}
			</td>
			<td className='px-3 py-4 text-center text-sm whitespace-nowrap'>
				<ListBox
					items={ROLE_OPTIONS}
					title=''
					id={`role-${user.id}`}
					name={`role-${user.id}`}
					defaultValue={defaultRole}
					onChange={handleRoleChange}
				/>
			</td>
			<td className='px-3 py-4 text-center text-sm whitespace-nowrap'>
				<ClientPicker
					disableAdd
					value={selectedClient}
					onChange={handleClientChange}
				/>
			</td>
		</tr>
	)
}

export default UserRow
