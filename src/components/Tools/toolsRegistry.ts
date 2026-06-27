import { ComponentType } from 'react'
import BestMixCalculator from './BestMixCalculator'
import BoosterCalculator from './BoosterCalculator'
import BlendCalculator from './BlendCalculator'
import BlendingCostCalculator from './BlendingCostCalculator'
import CascadeCalculator from './CascadeCalculator'
import EadCalculator from './EadCalculator'
import GasDensityCalculator from './GasDensityCalculator'
import GasMixingCalculator from './GasMixingCalculator'
import GasRequirementsCalculator from './GasRequirementsCalculator'
import ModEndCalculator from './ModEndCalculator'
import NitroxStickCalculator from './NitroxStickCalculator'
import OxygenExposureCalculator from './OxygenExposureCalculator'

export type ToolGroup = 'blending' | 'planning'

export type TabId =
	| 'cascade'
	| 'nitrox-stick'
	| 'blend'
	| 'blending-cost'
	| 'mod-end'
	| 'best-mix'
	| 'ead'
	| 'gas-density'
	| 'mix-two-gases'
	| 'oxygen-exposure'
	| 'gas-requirements'
	| 'booster'

export interface ToolDef {
	id: TabId
	name: string
	group: ToolGroup
	Component: ComponentType
	description: string
}

export const GROUPS: { id: ToolGroup; name: string }[] = [
	{ id: 'blending', name: 'Blending' },
	{ id: 'planning', name: 'Planning' },
]

export const TOOLS: ToolDef[] = [
	{
		id: 'cascade',
		name: 'Cascade Fill',
		group: 'blending',
		Component: CascadeCalculator,
		description:
			'Fill a cylinder from a bank of storage bottles, lowest-pressure bottle first, and see the final pressure and bank residuals.',
	},
	{
		id: 'nitrox-stick',
		name: 'Nitrox Stick',
		group: 'blending',
		Component: NitroxStickCalculator,
		description:
			'Top up a partial cylinder with pure oxygen to reach a target nitrox fraction, showing how much O₂ to add and the resulting mix.',
	},
	{
		id: 'blend',
		name: 'Blend (PP)',
		group: 'blending',
		Component: BlendCalculator,
		description:
			'Partial-pressure blend a cylinder to a target O₂/He mix by adding pure oxygen, helium, and then air or travel gas in sequence.',
	},
	{
		id: 'mix-two-gases',
		name: 'Mix Two Gases',
		group: 'blending',
		Component: GasMixingCalculator,
		description:
			'Combine two arbitrary gas mixes in a cylinder and calculate the resulting O₂, He, and N₂ fractions by pressure contribution.',
	},
	{
		id: 'blending-cost',
		name: 'Blending Cost',
		group: 'blending',
		Component: BlendingCostCalculator,
		description:
			'Estimate the gas cost of a partial-pressure blend by pricing each component (O₂, He, air) against the volume consumed.',
	},
	{
		id: 'booster',
		name: 'Booster',
		group: 'blending',
		Component: BoosterCalculator,
		description:
			'Model an oxygen booster pump fill — drive-air consumption, fill time, and cycle rate — for a given supply and receiver pressure.',
	},
	{
		id: 'mod-end',
		name: 'MOD / END',
		group: 'planning',
		Component: ModEndCalculator,
		description:
			'Calculate the Maximum Operating Depth for a gas at a ppO₂ limit and the Equivalent Narcotic Depth at any planned depth.',
	},
	{
		id: 'best-mix',
		name: 'Best Mix',
		group: 'blending',
		Component: BestMixCalculator,
		description:
			'Find the highest safe oxygen fraction for a target depth given a ppO₂ ceiling.',
	},
	{
		id: 'ead',
		name: 'EAD',
		group: 'planning',
		Component: EadCalculator,
		description:
			'Compute the Equivalent Air Depth of a nitrox or trimix gas at a given depth to look up air decompression tables.',
	},
	{
		id: 'gas-density',
		name: 'Gas Density',
		group: 'planning',
		Component: GasDensityCalculator,
		description:
			'Calculate breathing-gas density at depth and flag mixes that exceed the 5.2 g/L recommended limit or the 6.3 g/L hard limit.',
	},
	{
		id: 'oxygen-exposure',
		name: 'CNS / OTU',
		group: 'planning',
		Component: OxygenExposureCalculator,
		description:
			'Track cumulative CNS clock percentage and OTU oxygen toxicity exposure across multiple dive segments.',
	},
	{
		id: 'gas-requirements',
		name: 'Gas Requirements',
		group: 'planning',
		Component: GasRequirementsCalculator,
		description:
			'Estimate planned gas volume and rock-bottom minimum from a logged RMV, dive profile, and stress factor.',
	},
]
