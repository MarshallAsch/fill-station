import { useAppSelector } from '@/redux/hooks'
import { ReactNode } from 'react'
import AddCylinderModal from '../Modals/AddCylinderModal'

const ModalProvider = ({ children }: { children: ReactNode }) => {
	const { addCylinderModalOpen } = useAppSelector((state) => state.modal)

	return (
		<>
			{addCylinderModalOpen && <AddCylinderModal />}
			{children}
		</>
	)
}

export default ModalProvider
