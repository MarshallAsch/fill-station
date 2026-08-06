// Hydro and vis stamps only carry a month, so these tests pin a timezone west
// of UTC — that is where reading a UTC-midnight stamp locally lands in the
// previous month.
process.env.TZ = 'America/Toronto'

import { describe, it, expect } from 'vitest'
import dayjs from 'dayjs'
import { formatMonthStamp, parseMonthStamp, toMonthStamp } from './monthStamp'

describe('month stamps', () => {
	it('reads a stamp stored at UTC midnight as its own month', () => {
		expect(formatMonthStamp(new Date('2010-06-01'))).toBe('06/2010')
		expect(formatMonthStamp(new Date('2025-08-01'))).toBe('08/2025')
		expect(formatMonthStamp(new Date('2005-03-01'))).toBe('03/2005')
	})

	it('reads a stamp stored at local midnight as its own month', () => {
		// What the picker used to submit: local midnight on the first.
		expect(formatMonthStamp('2010-06-01T04:00:00.000Z')).toBe('06/2010')
	})

	it('formats with a custom pattern', () => {
		expect(formatMonthStamp(new Date('2010-06-01'), 'MMMM YYYY')).toBe(
			'June 2010',
		)
	})

	it('parses to the first of the month at UTC midnight', () => {
		const stamp = parseMonthStamp(new Date('2010-06-15'))
		expect(stamp.toISOString()).toBe('2010-06-01T00:00:00.000Z')
	})

	it('keeps the month when years are added for the next due date', () => {
		expect(
			parseMonthStamp(new Date('2023-06-01')).add(5, 'year').format('MM/YYYY'),
		).toBe('06/2028')
	})

	it('anchors a month picked in local time to UTC midnight', () => {
		// A picker showing August 2026 must submit August, not July.
		const stamp = toMonthStamp(dayjs('2026-08-06T12:00:00'))
		expect(stamp.toISOString()).toBe('2026-08-01T00:00:00.000Z')
		expect(stamp.format('MM/YYYY')).toBe('08/2026')
	})

	it('anchors a local time late in the month without rolling over', () => {
		// 21:00 local on Aug 31 is already Sep 1 in UTC.
		const stamp = toMonthStamp(dayjs('2026-08-31T21:00:00'))
		expect(stamp.toISOString()).toBe('2026-08-01T00:00:00.000Z')
	})

	it('round-trips a submitted stamp back to the same month', () => {
		const submitted = toMonthStamp(dayjs('2026-08-06T12:00:00')).toISOString()
		expect(formatMonthStamp(submitted)).toBe('08/2026')
	})

	it('leaves an already anchored stamp alone', () => {
		// The picker re-anchors whatever it is handed, including parsed stamps.
		const stamp = parseMonthStamp(new Date('2010-06-01'))
		expect(toMonthStamp(stamp).toISOString()).toBe(stamp.toISOString())
	})

	it('is stable for an undefined stamp', () => {
		expect(parseMonthStamp(undefined).date()).toBe(1)
	})
})
