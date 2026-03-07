export async function GET(request: Request) {
	return Response.json(
		{ error: 'not found', message: 'Not Found' },
		{ status: 404 },
	)
}

export async function POST(request: Request) {
	return GET(request)
}

export async function PUT(request: Request) {
	return GET(request)
}

export async function DELETE(request: Request) {
	return GET(request)
}
