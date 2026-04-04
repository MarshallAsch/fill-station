export const BOOL_OPTION_YES = 1
export const BOOL_OPTION_NO = 0

export const BOOL_OPTIONS = [
	{
		label: 'Yes',
		value: 1,
	},
	{
		label: 'No',
		value: 0,
	},
]

export const CYLINDER_MATERIAL_OPTION_STEEL = 'steel'
export const CYLINDER_MATERIAL_OPTION_ALUMINUM = 'aluminum'
export const CYLINDER_MATERIAL_OPTION_COMPOSITE = 'composite'

export const CYLINDER_MATERIAL_OPTIONS = [
	{
		label: 'Steel',
		value: 'steel',
	},
	{
		label: 'Aluminum',
		value: 'aluminum',
	},
	{
		label: 'Composite',
		value: 'composite',
	},
]

export const CYLINDER_MANUFACTURER_OPTIONS = [
	{ name: 'Faber', value: 'faber' },
	{ name: 'Worthington', value: 'worthington' },
	{ name: 'Catalina', value: 'catalina' },
	{ name: 'Luxfer', value: 'luxfer' },
	{ name: 'Other', value: 'other' },
]

export const PSI_INSPECTION_OPTION_ACCEPTABLE = 'acceptable'
export const PSI_INSPECTION_OPTIONS = [
	{
		label: 'Acceptable',
		value: 'acceptable',
	},
	{
		label: 'Marginal',
		value: 'marginal',
	},
	{
		label: 'Reject',
		value: 'reject',
	},
]

export const ROLE_OPTIONS = [
	{
		name: 'User',
		value: 'user',
	},
	{
		name: 'Admin',
		value: 'admin',
	},
	{
		name: 'Fill Operator',
		value: 'filler',
	},
	{
		name: 'Inspector',
		value: 'inspector',
	},
]

export const SERVICE_PRESSURE = [
	{
		name: '3000 psi',
		value: '3000',
	},
	{
		name: 'LP 2640 psi',
		value: '2640',
	},
	{
		name: 'HP 3442 psi',
		value: '3442',
	},
]

export function servicePressureOptions(
	pressures: number[],
): { name: string; value: string }[] {
	return pressures.map((p) => ({
		name: `${p} psi`,
		value: String(p),
	}))
}
