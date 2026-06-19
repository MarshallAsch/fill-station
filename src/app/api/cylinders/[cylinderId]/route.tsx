import dayjs from 'dayjs'
import { requireRole, isErrorResponse } from '@/lib/permissions-server'
import { auditLog } from '@/lib/audit'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { Cylinder } from '@/lib/models/cylinder'
import { sequelize } from '@/lib/models/config'
dayjs.extend(customParseFormat)

export async function PUT(
	request: Request,
	{ params }: { params: Promise<{ cylinderId: string }> },
) {
	const result = await requireRole(['filler', 'inspector', 'admin'])
	if (isErrorResponse(result)) return result

	const { cylinderId } = await params

	const cylinder = await Cylinder.findByPk(cylinderId)

	if (!cylinder) {
		return Response.json(
			{ message: `Cylinder Not Found with ID: ${cylinderId}` },
			{ status: 404 },
		)
	}

	const {
		serialNumber,
		birth,
		lastHydro,
		lastVis,
		oxygenClean,
		servicePressure,
		nickname,
		manufacturer,
		size,
		pairedCylinderId,
		pairNickname,
	} = await request.json()

	const normalizedPairNickname =
		typeof pairNickname === 'string' && pairNickname.trim() !== ''
			? pairNickname.trim()
			: null

	if (pairedCylinderId !== undefined && pairedCylinderId !== null) {
		if (Number(pairedCylinderId) === cylinder.id) {
			return Response.json(
				{
					error: 'invalid',
					message: 'A cylinder cannot be paired with itself',
				},
				{ status: 400 },
			)
		}
		const partner = await Cylinder.findByPk(pairedCylinderId)
		if (!partner) {
			return Response.json(
				{ error: 'not_found', message: 'Paired cylinder not found' },
				{ status: 400 },
			)
		}
		if (partner.ownerId !== cylinder.ownerId) {
			return Response.json(
				{
					error: 'invalid',
					message: 'Paired cylinders must have the same owner',
				},
				{ status: 400 },
			)
		}
	}

	cylinder.serialNumber = serialNumber
	cylinder.birth = dayjs(birth, 'YYYY-MM-DD')
	cylinder.lastHydro = dayjs(lastHydro, 'YYYY-MM-DD')
	cylinder.lastVis = dayjs(lastVis, 'YYYY-MM-DD')
	cylinder.oxygenClean = oxygenClean
	cylinder.servicePressure = servicePressure
	cylinder.nickname = nickname || null
	cylinder.manufacturer = manufacturer || null
	cylinder.size = size ? Number(size) : null
	cylinder.verified = true

	const transaction = await sequelize.transaction()
	try {
		if (pairedCylinderId !== undefined) {
			const previousPartnerId = cylinder.pairedCylinderId

			if (pairedCylinderId === null) {
				// Clearing: detach this cylinder and its old partner.
				if (previousPartnerId) {
					await Cylinder.update(
						{ pairedCylinderId: null, pairNickname: null },
						{ where: { id: previousPartnerId }, transaction },
					)
				}
				cylinder.pairedCylinderId = null
				cylinder.pairNickname = null
			} else {
				// Pairing to a new partner.
				// Detach this cylinder's old partner, if different.
				if (previousPartnerId && previousPartnerId !== pairedCylinderId) {
					await Cylinder.update(
						{ pairedCylinderId: null, pairNickname: null },
						{ where: { id: previousPartnerId }, transaction },
					)
				}
				// Detach the new partner's existing partner, if any.
				const partner = await Cylinder.findByPk(pairedCylinderId, {
					transaction,
				})
				if (!partner) {
					await transaction.rollback()
					return Response.json(
						{ error: 'not_found', message: 'Paired cylinder not found' },
						{ status: 400 },
					)
				}
				if (
					partner.pairedCylinderId &&
					partner.pairedCylinderId !== cylinder.id
				) {
					await Cylinder.update(
						{ pairedCylinderId: null, pairNickname: null },
						{ where: { id: partner.pairedCylinderId }, transaction },
					)
				}
				partner.pairedCylinderId = cylinder.id
				partner.pairNickname = normalizedPairNickname
				await partner.save({ transaction })
				cylinder.pairedCylinderId = pairedCylinderId
				cylinder.pairNickname = normalizedPairNickname
			}
		}

		const result = await cylinder.save({ transaction })
		await transaction.commit()
		return Response.json(result)
	} catch (err: any) {
		await transaction.rollback()
		console.error('error:', err)
		return Response.json(
			{ error: err.name, message: err.errors?.[0]?.message ?? err.message },
			{ status: 400 },
		)
	}
}

export async function DELETE(
	_request: Request,
	{ params }: { params: Promise<{ cylinderId: string }> },
) {
	const result = await requireRole(['admin'])
	if (isErrorResponse(result)) return result

	const { cylinderId } = await params
	const cylinder = await Cylinder.findByPk(cylinderId)

	if (!cylinder) {
		return Response.json(
			{ error: 'not_found', message: 'Cylinder not found' },
			{ status: 404 },
		)
	}

	await cylinder.destroy()
	await auditLog(result.user!.id!, 'delete', 'cylinder', cylinderId, {
		serialNumber: cylinder.serialNumber,
	})
	return Response.json({ message: 'Cylinder deleted' })
}
