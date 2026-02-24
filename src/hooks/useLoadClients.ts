import { getAllClients } from '@/app/_api'
import { setClients } from '@/redux/client/clientSlice'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { Client } from '@/types/client'
import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { useEffect, useMemo } from 'react'

const useLoadClients = () => {
	const { status, data, error } = useQuery({
		queryKey: ['clients'],
		queryFn: getAllClients,
	})

	const dispatch = useAppDispatch()
	const { allClients: clients } = useAppSelector((state) => state.clients)

	const formedData = useMemo<Client[]>(() => {
		if (!data) return []
		return data.map((data) => {
			return {
				...data,
				updatedAt: dayjs(data.updatedAt).toISOString(),
				createdAt: dayjs(data.createdAt).toISOString(),
			}
		})
	}, [data])

	useEffect(() => {
		if (!data) return

		dispatch(setClients(formedData))
	}, [data, formedData, clients, dispatch])

	return { clients, status, error }
}

export default useLoadClients
