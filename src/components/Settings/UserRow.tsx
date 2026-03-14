import { Profile } from '@/types/profile'

const UserRow = ({ user }: { user: Profile }) => {
	return (
		<tr className='hover:bg-gray-100 dark:hover:bg-gray-800'>
			<td className='py-4 pr-3 pl-4 text-center text-sm font-medium whitespace-nowrap text-gray-900 sm:pl-6 dark:text-gray-100'>
				{user.name ?? '—'}
			</td>
			<td className='px-3 py-4 text-center text-sm whitespace-nowrap text-gray-500 dark:text-gray-400'>
				{user.email ?? '—'}
			</td>
			<td className='px-3 py-4 text-center text-sm whitespace-nowrap text-gray-500 dark:text-gray-400'>
				{user.role}
			</td>
			<td className='px-3 py-4 text-center text-sm whitespace-nowrap text-gray-500 dark:text-gray-400'>
				{user.clientName ?? '—'}
			</td>
		</tr>
	)
}

export default UserRow
