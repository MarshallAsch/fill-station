import { getAllFills } from '@/app/_api'
import { setFillHistory } from '@/redux/history/historySlice'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { FillHistory } from '@/types/fills'
import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { useEffect, useMemo } from 'react'

const useLoadFills = ({ enabled = true }: { enabled?: boolean } = {}) => {
	const { status, data, error } = useQuery({
		queryKey: ['fills'],
		queryFn: getAllFills,
		enabled,
	})

	const dispatch = useAppDispatch()
	const { fillHistory: fills } = useAppSelector((state) => state.history)

	const formedData = useMemo<FillHistory[]>(() => {
		if (!data) return []
		return data
			.map((item) => {
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
				} as FillHistory
			})
			.sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf())
	}, [data])

	useEffect(() => {
		if (!data) return

		dispatch(setFillHistory(formedData))
	}, [data, formedData, fills, dispatch])

	return { fills, status, error }
}

export default useLoadFills
