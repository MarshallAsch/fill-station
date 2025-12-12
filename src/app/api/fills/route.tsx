import { Fill } from '@/lib/models/fill'

export async function GET(request: Request) {
	// For example, fetch data from your DB here

	let fills = await Fill.findAll()
	return new Response(JSON.stringify(fills), {
		status: 200,
		headers: { 'Content-Type': 'application/json' },
	})
}
