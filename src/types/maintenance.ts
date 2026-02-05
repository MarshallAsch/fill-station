export enum MAINTENANCE_TYPE {
	START = 'start',
	AIR_TEST = 'air-test',
	GENERAL = 'general',
	FILTER_CHANGE = 'filter-change',
	OIL_CHANGE = 'oil-change',
}

export type CompressorMaintenance = {
	id: number
	date: string
	type: MAINTENANCE_TYPE
	title: string
	content: string
}
