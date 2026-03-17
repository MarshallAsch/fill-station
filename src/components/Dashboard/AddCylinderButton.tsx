'use client'

import { useAppDispatch } from '@/redux/hooks'
import { setSelectedClient } from '@/redux/client/clientSlice'
import { updateAddCylinderModalOpen } from '@/redux/modal/modalSlice'
import Button from '@/components/UI/Button'
import { PlusIcon } from '@heroicons/react/24/outline'

type AddCylinderButtonProps = {
	client: { id: number; name: string }
}

const AddCylinderButton = ({ client }: AddCylinderButtonProps) => {
	const dispatch = useAppDispatch()

	const handleClick = () => {
		dispatch(setSelectedClient(client))
		dispatch(
			updateAddCylinderModalOpen({
				open: true,
				disableClient: true,
			}),
		)
	}

	return (
		<Button onClick={handleClick}>
			<PlusIcon className='mr-1 h-4 w-4' />
			Add Cylinder
		</Button>
	)
}

export default AddCylinderButton
