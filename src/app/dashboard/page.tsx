import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { User } from '@/lib/models/user'
import { Cylinder } from '@/lib/models/cylinder'
import { Fill } from '@/lib/models/fill'
import { Visual } from '@/lib/models/visual'
import { scopeQuery } from '@/lib/permissions'
import CylindersList from '@/components/Dashboard/CylindersList'
import RecentFills from '@/components/Dashboard/RecentFills'
import RecentVisuals from '@/components/Dashboard/RecentVisuals'
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
					<h1 className='text-3xl font-semibold text-gray-900 dark:text-gray-100'>
						Dashboard
					</h1>
					<NoClientMessage />
				</div>
			</div>
		)
	}

	const cylOptions = scopeQuery(dbUser, 'cylinder', {})
	const fillOptions = scopeQuery(dbUser, 'fill', {
		order: [['createdAt', 'DESC']],
		limit: 10,
		include: [{ model: Cylinder, attributes: ['serialNumber'] }],
	})
	const visOptions = scopeQuery(dbUser, 'visual', {
		order: [['createdAt', 'DESC']],
		limit: 10,
		include: [{ model: Cylinder, attributes: ['serialNumber'] }],
	})

	// Defense-in-depth: scopeQuery returns Response for user role without client.
	if (cylOptions instanceof Response) return redirect('/')
	if (fillOptions instanceof Response) return redirect('/')
	if (visOptions instanceof Response) return redirect('/')

	const cylinders = await Cylinder.findAll(cylOptions)
	const fills = await Fill.findAll(fillOptions)
	const visuals = await Visual.findAll(visOptions)

	return (
		<div className='max-w-7xl'>
			<div className='my-4 flex flex-col items-center justify-center gap-6'>
				<h1 className='text-3xl font-semibold text-gray-900 dark:text-gray-100'>
					Dashboard
				</h1>

				<div className='w-full'>
					<h2 className='mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100'>
						Cylinders
					</h2>
					<CylindersList cylinders={JSON.parse(JSON.stringify(cylinders))} />
				</div>

				<div className='w-full'>
					<h2 className='mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100'>
						Recent Fills
					</h2>
					<RecentFills fills={JSON.parse(JSON.stringify(fills))} />
				</div>

				<div className='w-full'>
					<h2 className='mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100'>
						Recent Visual Inspections
					</h2>
					<RecentVisuals visuals={JSON.parse(JSON.stringify(visuals))} />
				</div>
			</div>
		</div>
	)
}
