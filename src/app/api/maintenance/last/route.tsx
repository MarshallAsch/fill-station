import { Maintenance } from '@/lib/models/maintenance'
import { MAINTENANCE_TYPE } from '@/types/maintenance'
import dayjs from 'dayjs'

import customParseFormat from 'dayjs/plugin/customParseFormat'
dayjs.extend(customParseFormat)

export async function GET(request: Request) {
	let lookups = [
		Maintenance.findOne({
			where: {
				type: MAINTENANCE_TYPE.START,
			},
			order: [['date', 'DESC']],
			attributes: ['date', 'hours', 'description', 'type'],
		}),
		Maintenance.findOne({
			where: {
				type: MAINTENANCE_TYPE.OIL_CHANGE,
			},
			order: [['date', 'DESC']],
			attributes: ['date', 'hours', 'description', 'type'],
		}),
		Maintenance.findOne({
			where: {
				type: MAINTENANCE_TYPE.FILTER_CHANGE,
			},
			order: [['date', 'DESC']],
			attributes: ['date', 'hours', 'description', 'type'],
		}),
		Maintenance.findOne({
			where: {
				type: MAINTENANCE_TYPE.AIR_TEST,
			},
			order: [['date', 'DESC']],
			attributes: ['date', 'hours', 'description', 'type'],
		}),
		Maintenance.findOne({
			order: [['date', 'DESC']],
			attributes: ['date', 'hours', 'description', 'type'],
		}),
	]

	let [gotten, oil, filter, air, last] = await Promise.all(lookups)

	let results = {
		gotten,
		oil,
		filter,
		air,
		last,
	}
	return Response.json(results)
}
