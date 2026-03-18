import { auth } from '@/auth'
import ProfileForm from '@/components/Profile/ProfileForm'
import ThemeSettings from '@/components/Profile/ThemeSettings'
import { User } from '@/lib/models/user'
import { Client } from '@/lib/models/client'
import type { Profile } from '@/types/profile'

export default async function Profile() {
	const session = await auth()

	if (!session?.user) {
		return (
			<div className='max-w-7xl'>
				<div className='my-4 flex flex-col items-center justify-center'>
					<h1 className='text-text text-3xl font-semibold'>Profile</h1>
					<p className='text-light-text mt-4'>
						You must be logged in to view your profile.
					</p>
				</div>
			</div>
		)
	}

	const result = await User.findByPk(session.user.id, {
		include: [{ model: Client, as: 'client', attributes: ['name'] }],
	})

	if (!result) {
		return (
			<div className='max-w-7xl'>
				<div className='my-4 flex flex-col items-center justify-center'>
					<h1 className='text-text text-3xl font-semibold'>Profile</h1>
					<p className='text-light-text mt-4'>User not found.</p>
				</div>
			</div>
		)
	}

	const client = result.get('client') as Client | null
	const user: Profile = {
		id: result.id,
		name: result.name ?? null,
		email: result.email ?? null,
		image: result.image ?? null,
		theme: result.theme,
		lastLogin: result.lastLogin?.toISOString() ?? null,
		role: result.role,
		clientId: result.clientId ?? null,
		clientName: client?.name ?? null,
		notifyContact: result.notifyContact ?? true,
		notifyHydro: result.notifyHydro ?? true,
		notifyVisual: result.notifyVisual ?? true,
		hydroReminderDays1: result.hydroReminderDays1 ?? 180,
		hydroReminderDays2: result.hydroReminderDays2 ?? 30,
		visualReminderDays1: result.visualReminderDays1 ?? 60,
		visualReminderDays2: result.visualReminderDays2 ?? 30,
	}

	return (
		<div className='max-w-7xl'>
			<div className='my-4 flex flex-col items-center justify-center gap-6'>
				<h1 className='text-text text-3xl font-semibold'>Profile</h1>
				<ProfileForm user={user} />

				<h2 className='text-text text-2xl font-semibold'>Settings</h2>
				<ThemeSettings initialTheme={user.theme} />
			</div>
		</div>
	)
}
