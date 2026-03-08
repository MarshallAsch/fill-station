import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { ReactNode } from 'react'
import CylinderModal from '../Modals/CylinderModal'
import AddServiceModal from '../Modals/AddServiceModal'
import ClientModal from '../Modals/ClientModal'
import { updateClient } from '@/app/_api'
import {
	updateAddClientModalOpen,
	updateAddCylinderModalOpen,
	updateEditClientModal,
	updateEditCylinderModal,
} from '@/redux/modal/modalSlice'

const ModalProvider = ({ children }: { children: ReactNode }) => {
	const {
		addCylinderModalOpen,
		addClientModalOpen,
		addServiceModalOpen,
		editClient,
		editCylinder,
	} = useAppSelector((state) => state.modal)
	const dispatch = useAppDispatch()

	return (
		<>
			{addCylinderModalOpen && (
				<CylinderModal
					handleClose={() => dispatch(updateAddCylinderModalOpen(false))}
				/>
			)}
			{addServiceModalOpen && <AddServiceModal />}
			{addClientModalOpen && (
				<ClientModal
					handleClose={() => dispatch(updateAddClientModalOpen(false))}
				/>
			)}
			{editClient && (
				<ClientModal
					client={editClient}
					title='Edit Client'
					submitText='Update'
					description={`Update ${editClient.name}'s details.`}
					onSubmit={updateClient}
					handleClose={() => dispatch(updateEditClientModal(undefined))}
				/>
			)}
			{editCylinder && (
				<CylinderModal
					cylinder={editCylinder}
					title='Edit Cylinder'
					submitText='Update'
					description={`Update ${editCylinder?.serialNumber}'s details.`}
					onSubmit={async () => ''}
					handleClose={() => dispatch(updateEditCylinderModal(undefined))}
				/>
			)}
			{children}
		</>
	)
}

export default ModalProvider
