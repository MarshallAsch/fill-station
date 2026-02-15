import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { ReactNode } from 'react'
import AddCylinderModal from '../Modals/AddCylinderModal'
import AddServiceModal from '../Modals/AddServiceModal'
import ClientModal from '../Modals/ClientModal'
import { updateClient } from '@/app/_api'
import {
	updateAddClientModalOpen,
	updateEditClientModal,
} from '@/redux/modal/modalSlice'

const ModalProvider = ({ children }: { children: ReactNode }) => {
	const {
		addCylinderModalOpen,
		addClientModalOpen,
		addServiceModalOpen,
		editClient,
	} = useAppSelector((state) => state.modal)
	const dispatch = useAppDispatch()

	return (
		<>
			{addCylinderModalOpen && <AddCylinderModal />}
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
			{children}
		</>
	)
}

export default ModalProvider
