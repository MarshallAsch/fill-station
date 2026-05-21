import { getAllMaintenance, getMaintenanceSummary } from '@/app/_api'
import { useQuery } from '@tanstack/react-query'

export const useLoadMaintenanceSummary = () => {
	const { status, data, error } = useQuery({
		queryKey: ['maintenance', 'summary'],
		queryFn: getMaintenanceSummary,
	})

	return { summary: data, status, error }
}

export const useLoadMaintenance = () => {
	const { status, data, error } = useQuery({
		queryKey: ['maintenance'],
		queryFn: getAllMaintenance,
	})

	return { maintenance: data, status, error }
}
