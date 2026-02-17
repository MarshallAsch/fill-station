import { auth } from '@/auth'

export async function GET(request: Request) {
	const session = await auth()

	return Response.json({ message: session }, { status: 200 })
}
