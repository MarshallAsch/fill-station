import { Client, NewClientDTO } from '@/types/client'
import { Cylinder, NewCylinderDTO } from '@/types/cylinder'
import { Fill, FillHistory } from '@/types/fills'
import {
	CompressorMaintenance,
	MaintenanceSummary,
	NewMaintenanceDTO,
} from '@/types/maintenance'
import { NewVisualDTO, VisualHistory } from '@/types/visuals'
import axios from 'axios'
import dayjs from 'dayjs'
import { FillDto } from '../api/fills/route'

const axiosInstance = axios.create({validateStatus: (code) => code < 500 })

// Regex to identify ISO 8601 date strings
const dateRegExp = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z?/

function recursivelyParseDates(value: any) {
	if (typeof value === 'string' && dateRegExp.test(value)) {
		return dayjs(value) // Use a reliable parsing function
	}
	if (typeof value === 'object' && value !== null) {
		for (const key in value) {
			if (Object.prototype.hasOwnProperty.call(value, key)) {
				value[key] = recursivelyParseDates(value[key])
			}
		}
	}
	return value
}

axiosInstance.interceptors.response.use((response) => {
	recursivelyParseDates(response.data)
	return response
})

export async function getAllClients(): Promise<Client[]> {
	const result = await axiosInstance.get('/api/clients')
	return result.data
}

export async function getAllFills(): Promise<FillHistory[]> {
	const result = await axiosInstance.get('/api/fills')
	return result.data
}

export async function getAllVisuals(): Promise<VisualHistory[]> {
	const result = await axiosInstance.get('/api/visuals')
	return result.data
}

export async function getAllCylinders(): Promise<Cylinder[]> {
	const result = await axiosInstance.get('/api/cylinders')
	return result.data
}

export async function getAllMaintenance(): Promise<CompressorMaintenance[]> {
	const result = await axiosInstance.get('/api/maintenance')
	return result.data
}

export async function getMaintenanceSummary(): Promise<MaintenanceSummary> {
	const result = await axiosInstance.get('/api/maintenance/last')
	return result.data
}

export async function getClientCylinders(
	clientId: number | string,
): Promise<Cylinder[]> {
	const result = await axiosInstance.get(`/api/clients/${clientId}/cylinders`)
	return result.data
}

export async function newClient(
	client: NewClientDTO,
): Promise<Client | string> {
	const result = await axiosInstance.post('/api/clients', client)

	return result.status == 201 ? result.data : result.data.message
}

export async function updateClient(
	client: NewClientDTO,
): Promise<Client | string> {
	const result = await axiosInstance.put(`/api/clients/${client.id}`, client)

	return result.status == 200 ? result.data : result.data.message
}

export async function newCylinder(
	clientId: number,
	cylinderId: number | undefined,
	cylinder: NewCylinderDTO,
): Promise<Cylinder | string> {
	const result = await axiosInstance.post(
		`/api/clients/${clientId}/cylinders`,
		cylinder,
	)
	return result.status == 201 ? result.data : result.data.message
}

export async function updateCylinder(
	clientId: number,
	cylinderId: number | undefined,
	cylinder: NewCylinderDTO,
): Promise<Client | string> {
	const result = await axiosInstance.put(`/api/cylinders/${cylinderId}`, cylinder)

	return result.status == 200 ? result.data : result.data.message
}

export async function newMaintenance(
	record: NewMaintenanceDTO,
): Promise<CompressorMaintenance | string> {
	const result = await axiosInstance.post('/api/maintenance', record)

	return result.status == 201 ? result.data : result.data.message
}

export async function addNewFill(fills: FillDto[]): Promise<Fill[] | string> {
	const result = await axiosInstance.post('/api/fills', fills)

	return (await result.status) == 201 ? result.data : result.data.message
}

export async function newVisual(
	cylinderId: number,
	visual: NewVisualDTO,
): Promise<Client | string> {
	const result = await axiosInstance.post(`/api/cylinders/${cylinderId}/visuals`, visual)

	return result.status == 200 ? result.data : result.data.message
}
