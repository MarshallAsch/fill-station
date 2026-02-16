import { setCylinders } from '@/redux/cylinder/cylinderSlice'
import CylinderListTable from '../Cylinders/CylinderListTable'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { getAllCylinders } from '@/app/_api'
import { useQuery } from '@tanstack/react-query'

function useLoadCylinder() {
	const { status, data, error } = useQuery({
		queryKey: ['cylinders'],
		queryFn: getAllCylinders,
	})

	const dispatch = useAppDispatch()
	const { cylinders } = useAppSelector((state) => state.cylinders)

	if (data) {
		dispatch(setCylinders(data))
	}

	return { cylinders, status, error }
}

const CylinderList = () => {
	const { cylinders } = useLoadCylinder()
	return <CylinderListTable cylinders={cylinders || []} showOwner={true} />
}

export default CylinderList
