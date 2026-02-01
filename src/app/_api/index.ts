import { Client } from '@/redux/client/clientSlice'
import { Cylinder } from '@/redux/cylinder/cylinderSlice'
import { NewClientDTO } from '@/types/client'
import axios from 'axios'

export async function getAllClients(): Promise<Client[]> {
	let result = await axios.get('/api/clients')
	return result.data
}

export async function getAllCylinders(): Promise<Cylinder[]> {
	let result = await axios.get('/api/cylinders')
	return result.data
}

export async function getClientCylinders(
	clientId: string,
): Promise<Cylinder[]> {
	let result = await axios.get(`/api/clients/${clientId}/cylinders`)
	return result.data
}

export async function newClient(
	client: NewClientDTO,
): Promise<Client | string> {
	let result = await axios.post('/api/clients', client)

	return result.status == 201 ? result.data : result.data.message
}
