'use client'

import { getAllCylinders } from '@/app/_api'
import { setCylinders } from '@/redux/cylinder/cylinderSlice'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { Cylinder } from '@/types/cylinder'
import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { useEffect, useMemo } from 'react'

const useLoadCylinder = () => {
	const { status, data, error } = useQuery({
		queryKey: ['cylinders'],
		queryFn: getAllCylinders,
	})

	const dispatch = useAppDispatch()
	const { cylinders } = useAppSelector((state) => state.cylinders)

	const formedData = useMemo<Cylinder[]>(() => {
		if (!data) return []
		return data.map((data) => {
			return {
				...data,
				id: data.id,
				birth: data.birth ? dayjs(data.birth).toISOString() : '',
				lastHydro: data.lastHydro ? dayjs(data.lastHydro).toISOString() : '',
				lastVis: data.lastVis ? dayjs(data.lastVis).toISOString() : '',
				createdAt: data.createdAt ? dayjs(data.createdAt).toISOString() : '',
				updatedAt: data.updatedAt ? dayjs(data.updatedAt).toISOString() : '',
			}
		})
	}, [data])

	useEffect(() => {
		if (!data) return

		dispatch(setCylinders(formedData))
	}, [data, formedData, cylinders, dispatch])

	return { cylinders, status, error }
}

export default useLoadCylinder
