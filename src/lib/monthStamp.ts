import dayjs, { Dayjs } from 'dayjs'
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)

/**
 * Hydro and vis dates are month-precision stamps on the cylinder, not moments
 * in time. They are stored as UTC midnight on the first of the month so the
 * month reads the same everywhere — parsing them in local time lands in the
 * previous month for anyone west of UTC.
 */
export const parseMonthStamp = (stamp?: Dayjs | Date | string | null): Dayjs =>
	dayjs.utc(stamp ?? undefined).startOf('month')

export const formatMonthStamp = (
	stamp?: Dayjs | Date | string | null,
	format = 'MM/YYYY',
): string => parseMonthStamp(stamp).format(format)

/**
 * Anchors the month a picker is showing in local time to the stamp stored for
 * it, so a month picked late on the last day of the month does not roll over.
 */
export const toMonthStamp = (local: Dayjs): Dayjs =>
	dayjs.utc().year(local.year()).month(local.month()).startOf('month')
