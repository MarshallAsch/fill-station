'use server'

import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { User } from '@/lib/models/user'
import { Client } from '@/lib/models/client'
import { Profile } from '@/types/profile'
import UserListTable from '@/components/Settings/UserListTable'
import { AuditLog } from '@/lib/models/audit'
import AuditLogTable from '@/components/Settings/AuditLogTable'

export default async function Settings() {
	const session = await auth()

	if (!session?.user) {
		return redirect('/')
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
		lastLogin: u.lastLogin ? u.lastLogin.toISOString() : null,
	}))

	const auditEntries = await AuditLog.findAll({
		order: [['createdAt', 'DESC']],
		limit: 50,
		include: [{ model: User, as: 'user', attributes: ['name', 'email'] }],
	})

	return (
		<div className='max-w-7xl'>
			<div className='my-4 flex flex-col items-center justify-center gap-6'>
				<h1 className='text-text text-3xl font-semibold'>Admin Settings</h1>
				<UserListTable users={users} />
				<h2 className='text-text text-2xl font-semibold'>Audit Log</h2>
				<AuditLogTable entries={JSON.parse(JSON.stringify(auditEntries))} />
			</div>
		</div>
	)
}
