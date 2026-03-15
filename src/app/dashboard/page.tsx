import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { User } from '@/lib/models/user'
import { Cylinder } from '@/lib/models/cylinder'
import { Fill } from '@/lib/models/fill'
import { Visual } from '@/lib/models/visual'
import DashboardTabs from '@/components/Dashboard/DashboardTabs'
import NoClientMessage from '@/components/Dashboard/NoClientMessage'

export default async function Dashboard() {
	const session = await auth()
	if (!session?.user) return redirect('/')

	const dbUser = await User.findByPk(session.user.id)
	if (!dbUser) return redirect('/')

	// Dashboard always shows the current user's personal data.
	// If no linked client, show a message regardless of role.
	if (!dbUser.clientId) {
		return (
			<div className='max-w-7xl'>
				<div className='my-4 flex flex-col items-center justify-center gap-6'>
					<h1 className='text-text text-3xl font-semibold'>Dashboard</h1>
					<NoClientMessage />
				</div>
			</div>
		)
	}

	const clientId = dbUser.clientId

	const cylinders = await Cylinder.findAll({
		where: { ownerId: clientId },
	})

	const fills = await Fill.findAll({
		order: [['createdAt', 'DESC']],
		limit: 20,
		include: [
			{
				model: Cylinder,
				attributes: ['serialNumber'],
				where: { ownerId: clientId },
			},
		],
	})

	const visuals = await Visual.findAll({
		order: [['createdAt', 'DESC']],
		limit: 20,
		include: [
			{
				model: Cylinder,
				attributes: ['serialNumber'],
				where: { ownerId: clientId },
			},
		],
	})

	return (
		<div className='w-full max-w-7xl'>
			<div className='my-4 flex flex-col items-center justify-center gap-6'>
				<h1 className='text-text text-3xl font-semibold'>Dashboard</h1>
				<DashboardTabs
					cylinders={JSON.parse(JSON.stringify(cylinders))}
					fills={JSON.parse(JSON.stringify(fills))}
					visuals={JSON.parse(JSON.stringify(visuals))}
					hideVisDetails={dbUser.role === 'user'}
				/>
			</div>
		</div>
	)
}
