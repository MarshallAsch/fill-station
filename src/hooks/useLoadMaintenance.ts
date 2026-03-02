import { getAllMaintenance, getMaintenanceSummary } from '@/app/_api'
import { useAppDispatch } from '@/redux/hooks'
import { updateServiceModalHours } from '@/redux/modal/modalSlice'
import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'

export const useLoadMaintenanceSummary = () => {
	const { status, data, error } = useQuery({
		queryKey: ['maintenance', 'summary'],
		queryFn: getMaintenanceSummary,
	})

	const dispatch = useAppDispatch()
	useEffect(() => {
		if (data?.last) {
			dispatch(updateServiceModalHours(data?.last.hours))
		}
	}, [data, dispatch])

	return { summary: data, status, error }
}

export const useLoadMaintenance = () => {
	const { status, data, error } = useQuery({
		queryKey: ['maintenance'],
		queryFn: getAllMaintenance,
	})

	return { maintenance: data, status, error }
}
