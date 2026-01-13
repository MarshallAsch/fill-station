import { useAppSelector } from '@/redux/hooks'
import { ReactNode } from 'react'
import AddCylinderModal from '../Modals/AddCylinderModal'
import AddClientModal from '../Modals/AddClientModal'

const ModalProvider = ({ children }: { children: ReactNode }) => {
	const { addCylinderModalOpen, addClientModalOpen } = useAppSelector((state) => state.modal)

	return (
		<>
			{addCylinderModalOpen && <AddCylinderModal />}
			{addClientModalOpen && <AddClientModal />}
			{children}
		</>
	)
}

export default ModalProvider
