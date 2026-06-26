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
}

export const GROUPS: { id: ToolGroup; name: string }[] = [
	{ id: 'blending', name: 'Blending' },
	{ id: 'planning', name: 'Planning' },
]

export const TOOLS: ToolDef[] = [
	{ id: 'cascade', name: 'Cascade Fill', group: 'blending', Component: CascadeCalculator },
	{ id: 'nitrox-stick', name: 'Nitrox Stick', group: 'blending', Component: NitroxStickCalculator },
	{ id: 'blend', name: 'Blend (PP)', group: 'blending', Component: BlendCalculator },
	{ id: 'mix-two-gases', name: 'Mix Two Gases', group: 'blending', Component: GasMixingCalculator },
	{ id: 'blending-cost', name: 'Blending Cost', group: 'blending', Component: BlendingCostCalculator },
	{ id: 'booster', name: 'Booster', group: 'blending', Component: BoosterCalculator },
	{ id: 'mod-end', name: 'MOD / END', group: 'planning', Component: ModEndCalculator },
	{ id: 'best-mix', name: 'Best Mix', group: 'blending', Component: BestMixCalculator },
	{ id: 'ead', name: 'EAD', group: 'planning', Component: EadCalculator },
	{ id: 'gas-density', name: 'Gas Density', group: 'planning', Component: GasDensityCalculator },
	{ id: 'oxygen-exposure', name: 'CNS / OTU', group: 'planning', Component: OxygenExposureCalculator },
	{ id: 'gas-requirements', name: 'Gas Requirements', group: 'planning', Component: GasRequirementsCalculator },
]
