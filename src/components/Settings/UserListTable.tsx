import { Profile } from '@/types/profile'
import UserRow from './UserRow'

const UserListTable = ({ users }: { users: Profile[] }) => {
	return (
		<div className='mt-8 flow-root'>
			<div className='overflow-x-auto'>
				<div className='inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8'>
					<div className='shadow-sm outline-1 outline-black/5 sm:rounded-lg dark:outline-white/10'>
						<table className='relative min-w-full divide-y divide-gray-300 dark:divide-gray-700'>
							<thead className='bg-gray-50 dark:bg-gray-800'>
								<tr>
									<th
										scope='col'
										className='py-3.5 pr-3 pl-4 text-center text-sm font-semibold text-gray-900 sm:pl-6 dark:text-gray-100'
									>
										Name
									</th>
									<th
										scope='col'
										className='px-3 py-3.5 text-center text-sm font-semibold text-gray-900 dark:text-gray-100'
									>
										Email
									</th>
									<th
										scope='col'
										className='px-3 py-3.5 text-center text-sm font-semibold text-gray-900 dark:text-gray-100'
									>
										Role
									</th>
									<th
										scope='col'
										className='px-3 py-3.5 text-center text-sm font-semibold text-gray-900 dark:text-gray-100'
									>
										Linked Client
									</th>
								</tr>
							</thead>
							<tbody className='bg-background dark:bg-background divide-y divide-gray-200 dark:divide-gray-700'>
								{users.map((user) => (
									<UserRow key={user.id} user={user} />
								))}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>
	)
}

export default UserListTable
