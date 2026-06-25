import { ComponentType } from 'react'
import BestMixCalculator from './BestMixCalculator'
import BlendCalculator from './BlendCalculator'
import CascadeCalculator from './CascadeCalculator'
import EadCalculator from './EadCalculator'
import GasDensityCalculator from './GasDensityCalculator'
import ModEndCalculator from './ModEndCalculator'
import NitroxStickCalculator from './NitroxStickCalculator'

export type ToolGroup = 'blending' | 'planning'

export type TabId =
	| 'cascade'
	| 'nitrox-stick'
	| 'blend'
	| 'mod-end'
	| 'best-mix'
	| 'ead'
	| 'gas-density'

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
	{ id: 'mod-end', name: 'MOD / END', group: 'planning', Component: ModEndCalculator },
	{ id: 'best-mix', name: 'Best Mix', group: 'blending', Component: BestMixCalculator },
	{ id: 'ead', name: 'EAD', group: 'planning', Component: EadCalculator },
	{ id: 'gas-density', name: 'Gas Density', group: 'planning', Component: GasDensityCalculator },
]
