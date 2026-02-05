import { Cylinder } from './cylinder'

export type VisualHistory = {
	id: number
	Cylinder?: Cylinder

	valve: 'din' | 'yoke' | 'h' | 'none'

	heat: boolean
	painted: boolean
	odor: boolean
	bow: boolean
	bulges: boolean
	bell: boolean
	lineCorrosion: boolean

	exteriorDescription: string
	exteriorMarks: string
	externalStandards: 'acceptable' | 'marginal' | 'fail'

	internalContents: string
	internalDescription: string
	internalMarks: string
	internalStandards: 'acceptable' | 'marginal' | 'fail'

	threadingDescription: string
	badThreadCount: number
	threadingStandards: 'acceptable' | 'marginal' | 'fail'

	burstDiskReplaced: boolean
	oringReplaced: boolean
	dipTube: boolean
	needService: boolean
	rebuilt: boolean

	status: 'acceptable' | 'marginal' | 'fail'
	date: string
	oxygenCleaned: boolean
	markedOxygenClean: boolean
}
