import { getAllVisuals } from '@/app/_api'
import { setVisHistory } from '@/redux/history/historySlice'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { VisualHistory } from '@/types/visuals'
import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { useEffect, useMemo } from 'react'

const useLoadVisuals = ({ enabled = true }: { enabled?: boolean } = {}) => {
	const { status, data, error } = useQuery({
		queryKey: ['visuals'],
		queryFn: getAllVisuals,
		enabled,
		select: (data) =>
			[...data].sort(
				(a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf(),
			),
	})

	const dispatch = useAppDispatch()
	const { visHistory: visuals } = useAppSelector((state) => state.history)

	const formedData = useMemo<VisualHistory[]>(() => {
		if (!data) return []
		return data.map((item) => {
			const cyl = item.Cylinder
			return {
				...item,
				date: item.date ? dayjs(item.date).toISOString() : undefined,
				createdAt: item.createdAt
					? dayjs(item.createdAt).toISOString()
					: undefined,
				updatedAt: item.updatedAt
					? dayjs(item.updatedAt).toISOString()
					: undefined,
				Cylinder: cyl
					? {
							...cyl,
							id: cyl.id,
							birth: cyl.birth ? dayjs(cyl.birth).toISOString() : undefined,
							lastHydro: cyl.lastHydro
								? dayjs(cyl.lastHydro).toISOString()
								: undefined,
							lastVis: cyl.lastVis
								? dayjs(cyl.lastVis).toISOString()
								: undefined,
							createdAt: cyl.createdAt
								? dayjs(cyl.createdAt).toISOString()
								: undefined,
							updatedAt: cyl.updatedAt
								? dayjs(cyl.updatedAt).toISOString()
								: undefined,
						}
					: undefined,
			} as VisualHistory
		})
	}, [data])

	useEffect(() => {
		if (!data) return

		dispatch(setVisHistory(formedData))
	}, [data, formedData, visuals, dispatch])

	return { visuals, status, error }
}

export default useLoadVisuals
