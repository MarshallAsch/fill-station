import { Client, NewClientDTO, NewCylinderDTO } from '@/types/client'
import { Cylinder } from '@/types/cylinder'
import { FillHistory } from '@/types/fills'
import { VisualHistory } from '@/types/visuals'
import axios from 'axios'
import dayjs from 'dayjs'

export async function getAllClients(): Promise<Client[]> {
	let result = await axios.get('/api/clients')
	return result.data
}

export async function getAllFills(): Promise<FillHistory[]> {
	let result = await axios.get('/api/fills')
	return result.data.map((v: any) => ({ ...v, date: dayjs(v.date) }))
}

export async function getAllVisuals(): Promise<VisualHistory[]> {
	let result = await axios.get('/api/visuals')
	return result.data.map((v: any) => ({ ...v, date: dayjs(v.date) }))
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
