import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { User } from '@/lib/models/user'
import { Cylinder } from '@/lib/models/cylinder'
import { scopeQuery } from '@/lib/permissions-server'
import DashboardTabs from '@/components/Dashboard/DashboardTabs'
import NoClientMessage from '@/components/Dashboard/NoClientMessage'

export default async function Dashboard() {
	const session = await auth()
	if (!session?.user) return redirect('/')

	const dbUser = await User.findByPk(session.user.id)
	if (!dbUser) return redirect('/')

	// If user role has no linked client, show message
	if (dbUser.role === 'user' && !dbUser.clientId) {
		return (
			<div className='max-w-7xl'>
				<div className='my-4 flex flex-col items-center justify-center gap-6'>
					<h1 className='text-text text-3xl font-semibold'>Dashboard</h1>
					<NoClientMessage />
				</div>
			</div>
		)
	}

	const cylOptions = scopeQuery(dbUser, 'cylinder', {})

	// Defense-in-depth: scopeQuery returns Response for user role without client.
	if (cylOptions instanceof Response) return redirect('/')

	const cylinders = await Cylinder.findAll(cylOptions)

	return (
		<div className='w-full max-w-7xl'>
			<div className='my-4 flex flex-col items-center justify-center gap-6'>
				<h1 className='text-text text-3xl font-semibold'>Dashboard</h1>
				<DashboardTabs cylinders={JSON.parse(JSON.stringify(cylinders))} />
			</div>
		</div>
	)
}
