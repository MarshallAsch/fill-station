import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import { Cylinder } from '@/types/cylinder'

dayjs.extend(duration)

export const VISUAL_INTERVAL_MONTHS = 12
export const HYDRO_INTERVAL_YEARS = 5

export const needsVisual = (cylinder: Cylinder): boolean =>
	dayjs.duration(dayjs().diff(cylinder.lastVis)).asMonths() >
	VISUAL_INTERVAL_MONTHS

export const needsHydro = (cylinder: Cylinder): boolean =>
	dayjs.duration(dayjs().diff(cylinder.lastHydro)).asYears() >
	HYDRO_INTERVAL_YEARS
