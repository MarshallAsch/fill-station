import { useAppSelector } from '@/redux/hooks'
import { ReactNode } from 'react'
import AddCylinderModal from '../Modals/AddCylinderModal'
import AddServiceModal from '../Modals/AddServiceModal'

const ModalProvider = ({ children }: { children: ReactNode }) => {
	const { addCylinderModalOpen, addServiceModalOpen } = useAppSelector(
		(state) => state.modal,
	)

	return (
		<>
			{addCylinderModalOpen && <AddCylinderModal />}
			{addServiceModalOpen && <AddServiceModal />}
			{children}
		</>
	)
}

export default ModalProvider
