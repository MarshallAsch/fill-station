import { AuditLog } from '@/lib/models/audit'

export async function auditLog(
	userId: string,
	action: 'create' | 'update' | 'delete',
	entity: string,
	entityId: string | number,
	details?: object,
): Promise<void> {
	try {
		await AuditLog.create({
			userId,
			action,
			entity,
			entityId: String(entityId),
			details: details ?? null,
		})
	} catch (err) {
		console.error('Failed to write audit log:', err)
	}
}
