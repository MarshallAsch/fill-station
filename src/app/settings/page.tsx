import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { User } from '@/lib/models/user'
import { Client } from '@/lib/models/client'
import { Profile } from '@/types/profile'
import UserListTable from '@/components/Settings/UserListTable'

export default async function Settings() {
	const session = await auth()

	if (!session?.user) {
		return redirect('/')
	}

	if (session.user.role !== 'admin') {
		return (
			<div className='max-w-7xl'>
				<div className='my-4 flex flex-col items-center justify-center'>
					<h1 className='text-3xl font-semibold text-gray-900 dark:text-gray-100'>
						Admin Settings
					</h1>
					<p className='mt-4 text-gray-500 dark:text-gray-400'>
						You do not have permission to access this page.
					</p>
				</div>
			</div>
		)
	}

	const dbUsers = await User.findAll({
		include: [{ model: Client, as: 'client', attributes: ['name'] }],
	})

	const users: Profile[] = dbUsers.map((u) => ({
		id: u.id,
		name: u.name ?? null,
		email: u.email ?? null,
		image: u.image ?? null,
		theme: u.theme,
		role: u.role,
		clientId: u.clientId ?? null,
		clientName: (u as any).client?.name ?? null,
	}))

	return (
		<div className='max-w-7xl'>
			<div className='my-4 flex flex-col items-center justify-center gap-6'>
				<h1 className='text-3xl font-semibold text-gray-900 dark:text-gray-100'>
					Admin Settings
				</h1>
				<UserListTable users={users} />
			</div>
		</div>
	)
}
