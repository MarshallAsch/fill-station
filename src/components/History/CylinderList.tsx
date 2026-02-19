import { setCylinders } from '@/redux/cylinder/cylinderSlice'
import CylinderListTable from '../Cylinders/CylinderListTable'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { getAllCylinders } from '@/app/_api'
import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'

function useLoadCylinder() {
	const { status, data, error } = useQuery({
		queryKey: ['cylinders'],
		queryFn: getAllCylinders,
	})

	const dispatch = useAppDispatch()
	const { cylinders } = useAppSelector((state) => state.cylinders)

	if (data) {
		const formedData = data.map((data) => {
			return {
				...data,
				birth: dayjs(data.birth).toISOString(),
				lastHydro: dayjs(data.lastHydro).toISOString(),
				lastVis: dayjs(data.lastVis).toISOString(),
			}
		})
		dispatch(setCylinders(formedData))
	}

	return { cylinders, status, error }
}

const CylinderList = () => {
	const { cylinders } = useLoadCylinder()
	return <CylinderListTable cylinders={cylinders || []} showOwner={true} />
}

export default CylinderList
