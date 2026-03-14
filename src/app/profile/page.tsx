import { auth } from '@/auth'
import { sequelize } from '@/lib/models/config'
import { QueryTypes } from 'sequelize'
import ProfileForm from '@/components/Profile/ProfileForm'

interface UserRecord {
	id: string
	name: string | null
	email: string | null
	image: string | null
}

export default async function Profile() {
	const session = await auth()

	if (!session?.user) {
		return (
			<div className='max-w-7xl'>
				<div className='my-4 flex flex-col items-center justify-center'>
					<h1 className='text-3xl font-semibold text-gray-900'>Profile</h1>
					<p className='mt-4 text-gray-500'>
						You must be logged in to view your profile.
					</p>
				</div>
			</div>
		)
	}

	const [user] = await sequelize.query<UserRecord>(
		'SELECT id, name, email, image FROM users WHERE email = :email LIMIT 1',
		{
			replacements: { email: session.user.email },
			type: QueryTypes.SELECT,
		},
	)

	if (!user) {
		return (
			<div className='max-w-7xl'>
				<div className='my-4 flex flex-col items-center justify-center'>
					<h1 className='text-3xl font-semibold text-gray-900'>Profile</h1>
					<p className='mt-4 text-gray-500'>User not found.</p>
				</div>
			</div>
		)
	}

	return (
		<div className='max-w-7xl'>
			<div className='my-4 flex flex-col items-center justify-center gap-6'>
				<h1 className='text-3xl font-semibold text-gray-900'>Profile</h1>
				<ProfileForm user={user} />
			</div>
		</div>
	)
}
