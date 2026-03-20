import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { SETTINGS_TAB } from './tabs'
import { getSettings } from '@/lib/settings'
import { User } from '@/lib/models/user'
import { Client } from '@/lib/models/client'
import { AuditLog } from '@/lib/models/audit'
import { Profile } from '@/types/profile'
import nconf from '@/lib/config'
import InspectionTab from '@/components/Settings/InspectionTab'
import CylindersTab from '@/components/Settings/CylindersTab'
import NotificationsTab from '@/components/Settings/NotificationsTab'
import UserListTable from '@/components/Settings/UserListTable'
import AuditLogTable from '@/components/Settings/AuditLogTable'

export default async function Settings({
	searchParams,
}: {
	searchParams: Promise<{ tab?: string }>
}) {
	const session = await auth()
	if (!session?.user) {
		return redirect('/')
	}

	const params = await searchParams
	const tab = (Object.values(SETTINGS_TAB) as Array<unknown>).includes(
		params.tab,
	)
		? (params.tab as SETTINGS_TAB)
		: SETTINGS_TAB.INSPECTION

	switch (tab) {
		case SETTINGS_TAB.INSPECTION: {
			const settings = await getSettings()
			const inspectors = await User.findAll({
				where: { role: 'inspector' },
				attributes: ['id', 'name'],
			})
			return (
				<InspectionTab
					settings={JSON.parse(JSON.stringify(settings))}
					inspectors={JSON.parse(JSON.stringify(inspectors))}
				/>
			)
		}

		case SETTINGS_TAB.CYLINDERS: {
			const settings = await getSettings()
			return <CylindersTab settings={JSON.parse(JSON.stringify(settings))} />
		}

		case SETTINGS_TAB.NOTIFICATIONS: {
			const smtp = {
				host: nconf.get('smtp:host') || undefined,
				port: nconf.get('smtp:port') || undefined,
				from: nconf.get('smtp:from') || undefined,
				shopEmail: nconf.get('smtp:shop_email') || undefined,
			}
			return <NotificationsTab smtp={smtp} />
		}

		case SETTINGS_TAB.USERS: {
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
				notifyContact: u.notifyContact ?? true,
				notifyHydro: u.notifyHydro ?? true,
				notifyVisual: u.notifyVisual ?? true,
				hydroReminderDays1: u.hydroReminderDays1 ?? 180,
				hydroReminderDays2: u.hydroReminderDays2 ?? 30,
				visualReminderDays1: u.visualReminderDays1 ?? 60,
				visualReminderDays2: u.visualReminderDays2 ?? 30,
			}))
			return <UserListTable users={users} />
		}

		case SETTINGS_TAB.AUDIT_LOG: {
			const auditEntries = await AuditLog.findAll({
				order: [['createdAt', 'DESC']],
				limit: 50,
				include: [
					{
						model: User,
						as: 'user',
						attributes: ['name', 'email'],
					},
				],
			})
			return (
				<AuditLogTable entries={JSON.parse(JSON.stringify(auditEntries))} />
			)
		}
	}
}
