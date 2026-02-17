import { auth } from '@/auth'
import { Client } from '@/lib/models/client'

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ clientId: string }> },
) {
	const session = await auth()
	if (!session)
		return Response.json(
			{ error: 'auth', message: 'Must be logged in' },
			{ status: 401 },
		)

	const { clientId } = await params
	let client = await Client.findByPk(clientId)
	return Response.json(client)
}

export async function PUT(
	request: Request,
	{ params }: { params: Promise<{ clientId: string }> },
) {
	const session = await auth()
	if (!session)
		return Response.json(
			{ error: 'auth', message: 'Must be logged in' },
			{ status: 401 },
		)

	let { name, nitroxCert, advancedNitroxCert, trimixCert, inspectionCert } =
		await request.json()

	const { clientId } = await params
	let client = await Client.findByPk(clientId)

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
		let result = await client.save()
		return Response.json(result)
	} catch (err: any) {
		console.error('error:', err)
		return Response.json(
			{ error: err.name, message: err.errors[0].message },
			{ status: 400 },
		)
	}
}
