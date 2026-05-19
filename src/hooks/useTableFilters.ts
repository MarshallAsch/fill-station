'use client'

import { useMemo } from 'react'

type UseTableFiltersOptions<T> = {
	predicates?: Array<(item: T) => boolean>
	sort?: (a: T, b: T) => number
}

const useTableFilters = <T,>(
	items: T[],
	{ predicates, sort }: UseTableFiltersOptions<T> = {},
): T[] => {
	return useMemo(() => {
		let result = items
		if (predicates && predicates.length > 0) {
			result = result.filter((item) => predicates.every((p) => p(item)))
		}
		if (sort) {
			result = [...result].sort(sort)
		}
		return result
	}, [items, predicates, sort])
}

export default useTableFilters
