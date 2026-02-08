import dayjs from 'dayjs'

export enum MAINTENANCE_TYPE {
	START = 'start',
	AIR_TEST = 'air-test',
	GENERAL = 'general',
	FILTER_CHANGE = 'filter-change',
	OIL_CHANGE = 'oil-change',
	UNKNOWN = 'unknown',
}

export type CompressorMaintenance = {
	id: number
	date: dayjs.Dayjs
	type: MAINTENANCE_TYPE
	description: string
	hours: number
}

export type NewMaintenanceDTO = {
	date: dayjs.Dayjs
	type: MAINTENANCE_TYPE
	description: string
	hours: number
}

export type MaintenanceSummaryItem = {
	date: dayjs.Dayjs
	hours: number
	description: string
	type: MAINTENANCE_TYPE
}

export type MaintenanceSummary = {
	gotten: MaintenanceSummaryItem
	oil: MaintenanceSummaryItem
	filter: MaintenanceSummaryItem
	air: MaintenanceSummaryItem
	last: MaintenanceSummaryItem
}
