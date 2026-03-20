import { requireRole, isErrorResponse } from '@/lib/permissions-server'
import {
	getSettings,
	updateSettings,
	validateInspectorId,
} from '@/lib/settings'

export async function GET() {
	const result = await requireRole(['admin'])
	if (isErrorResponse(result)) return result

	const settings = await getSettings()
	return Response.json(settings)
}

export async function PATCH(request: Request) {
	const result = await requireRole(['admin'])
	if (isErrorResponse(result)) return result

	const body = await request.json()

	// Validate inspector ID if provided
	if ('defaultInspectorId' in body) {
		const error = await validateInspectorId(body.defaultInspectorId)
		if (error) {
			return Response.json(
				{ error: 'validation', message: error },
				{ status: 400 },
			)
		}
	}

	try {
		const updated = await updateSettings(result.user!.id!, body)
		return Response.json(updated)
	} catch (err: any) {
		return Response.json(
			{ error: 'validation', message: err.message },
			{ status: 400 },
		)
	}
}
