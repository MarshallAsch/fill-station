import dayjs from 'dayjs'
import { auth } from '@/auth'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { Contact } from '@/lib/models/contact'
import { NewContactDTO } from '@/types/contact'
dayjs.extend(customParseFormat)

export async function GET(request: Request) {
	const session = await auth()
	if (!session)
		return Response.json(
			{ error: 'auth', message: 'Must be logged in' },
			{ status: 401 },
		)
	const result = await Contact.findAll()
	return Response.json(result)
}

export async function POST(request: Request) {
	const record: NewContactDTO = await request.json()

	const result = await Contact.create(record)
	return Response.json(result)
}
