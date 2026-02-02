import { Client } from '@/redux/client/clientSlice'
import { Cylinder } from '@/redux/cylinder/cylinderSlice'
import { FillHistory } from '@/redux/history/historySlice'
import { NewClientDTO, NewCylinderDTO } from '@/types/client'
import { VisualHistory } from '@/types/visuals'
import axios from 'axios'

export async function getAllClients(): Promise<Client[]> {
	let result = await axios.get('/api/clients')
	return result.data
}

export async function getAllFills(): Promise<FillHistory[]> {
	let result = await axios.get('/api/fills')
	return result.data
}

export async function getAllVisuals(): Promise<VisualHistory[]> {
	let result = await axios.get('/api/visuals')
	return result.data
}

export async function getAllCylinders(): Promise<Cylinder[]> {
	let result = await axios.get('/api/cylinders')
	return result.data
}

export async function getClientCylinders(
	clientId: number | string,
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

export async function newCylinder(
	clientId: number,
	cylinder: NewCylinderDTO,
): Promise<Cylinder | string> {
	let result = await axios.post(`/api/clients/${clientId}/cylinders`, cylinder)
	return result.status == 201 ? result.data : result.data.message
}
