'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'

type UsePaginationResult<T> = {
	page: number
	setPage: (page: number) => void
	totalPages: number
	paginatedItems: T[]
}

const usePagination = <T,>(
	items: T[],
	rowsPerPage = 20,
): UsePaginationResult<T> => {
	const [page, setPage] = useState(1)
	const [, startTransition] = useTransition()

	const totalPages = Math.max(1, Math.ceil(items.length / rowsPerPage))

	useEffect(() => {
		startTransition(() => {
			setPage(1)
		})
	}, [items.length])

	const paginatedItems = useMemo(() => {
		const start = (page - 1) * rowsPerPage
		return items.slice(start, start + rowsPerPage)
	}, [items, page, rowsPerPage])

	return { page, setPage, totalPages, paginatedItems }
}

export default usePagination
