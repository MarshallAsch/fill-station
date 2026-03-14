import { Client } from '@/lib/models/client'
import { requireRole, isErrorResponse } from '@/lib/permissions-server'
import { auditLog } from '@/lib/audit'

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ clientId: string }> },
) {
	const result = await requireRole(['filler', 'inspector', 'admin'])
	if (isErrorResponse(result)) return result

	const { clientId } = await params
	const client = await Client.findByPk(clientId)
	return Response.json(client)
}

export async function PUT(
	request: Request,
	{ params }: { params: Promise<{ clientId: string }> },
) {
	const result = await requireRole(['filler', 'inspector', 'admin'])
	if (isErrorResponse(result)) return result
	const { name, nitroxCert, advancedNitroxCert, trimixCert, inspectionCert } =
		await request.json()

	const { clientId } = await params
	const client = await Client.findByPk(clientId)

	if (!client) {
		return Response.json(
			{ message: `Client Not Found with ID: ${clientId}` },
			{ status: 404 },
		)
	}

	client.name = name
	client.nitroxCert = nitroxCert
	client.advancedNitroxCert = advancedNitroxCert
	client.trimixCert = trimixCert
	client.inspectionCert = inspectionCert

	try {
		const saved = await client.save()
		return Response.json(saved)
	} catch (err: any) {
		console.error('error:', err)
		return Response.json(
			{ error: err.name, message: err.errors[0].message },
			{ status: 400 },
		)
	}
}

export async function DELETE(
	_request: Request,
	{ params }: { params: Promise<{ clientId: string }> },
) {
	const result = await requireRole(['admin'])
	if (isErrorResponse(result)) return result

	const { clientId } = await params
	const client = await Client.findByPk(clientId)

	if (!client) {
		return Response.json(
			{ error: 'not_found', message: 'Client not found' },
			{ status: 404 },
		)
	}

	await client.destroy()
	await auditLog(result.user!.id!, 'delete', 'client', clientId, {
		name: client.name,
	})
	return Response.json({ message: 'Client deleted' })
}
