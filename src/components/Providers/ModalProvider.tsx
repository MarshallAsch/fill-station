import { useAppSelector } from '@/redux/hooks'
import { ReactNode } from 'react'
import AddCylinderModal from '../Modals/AddCylinderModal'
import AddServiceModal from '../Modals/AddServiceModal'
import AddClientModal from '../Modals/AddClientModal'

const ModalProvider = ({ children }: { children: ReactNode }) => {
	const { addCylinderModalOpen, addClientModalOpen, addServiceModalOpen } =
		useAppSelector((state) => state.modal)

	return (
		<>
			{addCylinderModalOpen && <AddCylinderModal />}
			{addServiceModalOpen && <AddServiceModal />}
			{addClientModalOpen && <AddClientModal />}
			{children}
		</>
	)
}

export default ModalProvider
