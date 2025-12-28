import { Client } from '@/lib/models/client'

export async function GET(request: Request) {
	let clients = await Client.findAll()
	return Response.json(clients)
}

export async function POST(request: Request) {
	let { name, nitroxCert, advancedNitroxCert, trimixCert, inspectionCert } =
		await request.json()

	if (name == undefined) {
		return Response.json(
			{ error: 'missing', message: 'Missing required fields' },
			{ status: 400 },
		)
	}

	try {
		let result = await Client.create({
			name: name,
			nitroxCert: nitroxCert,
			advancedNitroxCert: advancedNitroxCert,
			trimixCert: trimixCert,
			inspectionCert: inspectionCert,
		})

		return Response.json(result)
	} catch (err: any) {
		console.error('error:', err)
		return Response.json(
			{ error: err.name, message: err.errors[0].message },
			{ status: 400 },
		)
	}
}
