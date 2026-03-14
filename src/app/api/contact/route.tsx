import dayjs from 'dayjs'
import { requireRole, isErrorResponse } from '@/lib/permissions'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { Contact } from '@/lib/models/contact'
import { NewContactDTO } from '@/types/contact'
dayjs.extend(customParseFormat)

export async function GET(request: Request) {
	const result = await requireRole(['admin'])
	if (isErrorResponse(result)) return result

	const contacts = await Contact.findAll()
	return Response.json(contacts)
}

export async function POST(request: Request) {
	const record: NewContactDTO = await request.json()

	const result = await Contact.create(record)
	return Response.json(result)
}
