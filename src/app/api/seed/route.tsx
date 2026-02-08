import { Cylinder } from '@/lib/models/cylinder'
import { Fill } from '@/lib/models/fill'
import { Maintenance } from '@/lib/models/maintenance'

import { Client } from '@/lib/models/client'
import dayjs from 'dayjs'

import { generate } from 'random-words'
import { sequelize } from '@/lib/models/config'
import { Visual } from '@/lib/models/visual'
import { MAINTENANCE_TYPE } from '@/types/maintenance'

function randomString(): string {
	return (generate(2) as Array<string>).join('_')
}

function generateClient(): Client {
	const certLevel = Math.trunc(Math.random() * 5)

	return Client.build({
		name: randomString(),
		nitroxCert: certLevel > 0 ? randomString() : undefined,
		advancedNitroxCert: certLevel > 1 ? randomString() : undefined,
		trimixCert: certLevel > 2 ? randomString() : undefined,
		inspectionCert: certLevel > 3 ? randomString() : undefined,
	})
}

function generateCylinder(client: Client): Cylinder {
	let birth = dayjs()
		.year(1990 + Math.trunc(Math.random() * 30))
		.month(5)
	let maxYear = dayjs().year() - birth.year() - 1
	let lastHydro = birth.add(Math.trunc(Math.random() * maxYear), 'year')

	let c = Cylinder.build({
		serialNumber: randomString(),
		birth: birth,
		lastHydro: lastHydro,
		lastVis: Math.random() > 0.5 ? lastHydro : lastHydro.add(14, 'month'),
		oxygenClean: Math.random() > 0.5,
		material: Math.random() > 0.4 ? 'steel' : 'aluminum',
		ownerId: client.id,
		servicePressure: [2640, 3000, 3442][Math.trunc(Math.random() * 3)],
	})

	return c
}

function generateFill(cylinder: Cylinder): Fill {
	let max = [2640, 3000, 3442][Math.trunc(Math.random() * 3)]
	return Fill.build({
		date: dayjs().subtract(Math.trunc(Math.random() * 180), 'day'),
		CylinderId: cylinder.id,
		startPressure: Math.trunc(Math.random() * (max - 200)),
		endPressure: max,
		helium: cylinder.owner?.trimixCert ? Math.random() * 45 : undefined,
	})
}

function generateVis(cylinder: Cylinder, inspector: Client): Visual {
	return Visual.build({
		date: dayjs().subtract(Math.trunc(Math.random() * 180), 'day'),
		CylinderId: cylinder.id,
		inspectorId: inspector.id,
		valve: Math.random() > 0.4 ? 'din' : 'yoke',
		heat: Math.random() > 0.7,
		painted: Math.random() > 0.7,
		odor: Math.random() > 0.7,
		bow: Math.random() > 0.7,
		bulges: Math.random() > 0.7,
		bell: Math.random() > 0.7,
		lineCorrosion: Math.random() > 0.7,
		exteriorDescription: '',
		exteriorMarks: '',
		externalStandards: 'acceptable',
		internalContents: '',
		internalDescription: '',
		internalMarks: '',
		internalStandards: 'acceptable',
		threadingDescription: '',
		badThreadCount: 0,
		threadingStandards: 'acceptable',
		burstDiskReplaced: Math.random() > 0.7,
		oringReplaced: Math.random() > 0.1,
		dipTube: true,
		needService: Math.random() > 0.8,
		rebuilt: Math.random() > 0.7,
		status: 'acceptable',
		oxygenCleaned: Math.random() > 0.7,
		markedOxygenClean: Math.random() > 0.5,
	})
}

function generateMaintenance(): Maintenance[] {
	return [
		{
			date: dayjs('2024-11-21T00:00:00.000'),
			type: MAINTENANCE_TYPE.START,
			title: 'Got the compressor',
			description: '',
			hours: 0,
		},
		{
			date: dayjs('2025-01-10T00:00:00.000'),
			type: MAINTENANCE_TYPE.AIR_TEST,
			title: 'Air analysis done',
			description: 'Buro Veritas',
			hours: 2,
		},
		{
			date: dayjs('2025-11-10T00:00:00.000'),
			type: MAINTENANCE_TYPE.OIL_CHANGE,
			title: 'Changed Oil',
			description: '',
			hours: 14,
		},
		{
			date: dayjs('2025-07-10T00:00:00.000'),
			type: MAINTENANCE_TYPE.FILTER_CHANGE,
			title: 'Changed Filter',
			description: 'P21 on the compressor',
			hours: 7,
		},
		{
			date: dayjs('2025-11-09T00:00:00.000'),
			type: MAINTENANCE_TYPE.FILTER_CHANGE,
			title: 'Changed Filter',
			description: 'P21 on the compressor',
			hours: 13,
		},
		{
			date: dayjs('2025-11-09T00:00:00.000'),
			type: MAINTENANCE_TYPE.AIR_TEST,
			title: 'Air analysis done',
			description: 'Aircheck Lab',
			hours: 13,
		},
		{
			date: dayjs('2025-11-10T00:00:00.000'),
			type: MAINTENANCE_TYPE.FILTER_CHANGE,
			title: 'Changed Filter',
			description: 'P61 on the wall',
			hours: 14,
		},
		{
			date: dayjs('2025-11-10T00:00:00.000'),
			type: MAINTENANCE_TYPE.GENERAL,
			title: 'General Service',
			description: 'Inspected things',
			hours: 14,
		},
	].map((r) => Maintenance.build(r))
}

export async function GET(request: Request) {
	if (process.env.NODE_ENV !== 'development') {
		return Response.json(
			{ message: 'Only available when running in dev mode' },
			{ status: 400 },
		)
	}

	await sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
	await sequelize.sync({ force: true })
	await sequelize.query('SET FOREIGN_KEY_CHECKS = 1')

	let clients = await Promise.all(
		Array.from({ length: 10 }, () => generateClient().save()),
	)
	let cylinders = await Promise.all(
		clients
			.map((c) =>
				Array.from({ length: Math.trunc(Math.random() * 15) }, () =>
					generateCylinder(c).save(),
				),
			)
			.flat(),
	)
	await Promise.all(
		cylinders
			.map((c) =>
				Array.from({ length: Math.trunc(Math.random() * 4) }, () =>
					generateFill(c).save(),
				),
			)
			.flat(),
	)

	let inspector = clients.filter((c) => c.inspectionCert)[0]
	console.log(inspector)

	await Promise.all(
		cylinders
			.map((c) =>
				Array.from({ length: Math.trunc(Math.random() * 4) }, () =>
					generateVis(c, inspector).save(),
				),
			)
			.flat(),
	)

	await Promise.all(generateMaintenance().map((r) => r.save()))

	return Response.json({ message: 'cleared' }, { status: 200 })
}
