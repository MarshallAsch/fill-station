import { Client } from '@/lib/models/client'

export async function GET(request: Request) {
	// For example, fetch data from your DB here

	let client = await Client.findAll()
	return new Response(JSON.stringify(client), {
		status: 200,
		headers: { 'Content-Type': 'application/json' },
	})
}
