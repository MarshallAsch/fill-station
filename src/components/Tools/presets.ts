export interface TankPreset {
	name: string
	waterVolumeL: number
	ratedBar: number
}

// Common scuba cylinders — water (internal) volume in litres, rated pressure in
// bar. Aluminum (AL*) water volumes from the Luxfer aluminum cylinder spec sheet
// (XS Scuba, rev 19A); steel HP* from the Faber steel cylinder spec sheet
// (XS Scuba). Cylinder names are NOMINAL capacity — e.g. Luxfer lists the AL80's
// true capacity as 77.4 cu ft — so a free-gas figure computed from water volume ×
// working pressure is an ideal-gas estimate and won't exactly match the name.
// LP85/LP95 are approximate (not on those sheets); the metric NL sizes are
// water-volume by definition.
export const DIVE_TANKS: TankPreset[] = [
	{ name: 'AL80 (S80)', waterVolumeL: 11.1, ratedBar: 207 },
	{ name: 'AL63', waterVolumeL: 9.0, ratedBar: 207 },
	{ name: 'AL40', waterVolumeL: 5.7, ratedBar: 207 },
	{ name: 'AL30 (pony)', waterVolumeL: 4.3, ratedBar: 207 },
	{ name: 'HP100', waterVolumeL: 12.9, ratedBar: 237 },
	{ name: 'HP117', waterVolumeL: 15.0, ratedBar: 237 },
	{ name: 'HP120', waterVolumeL: 15.3, ratedBar: 237 },
	{ name: 'HP133', waterVolumeL: 17.0, ratedBar: 237 },
	{ name: 'LP85', waterVolumeL: 11.1, ratedBar: 182 },
	{ name: 'LP95', waterVolumeL: 12.4, ratedBar: 182 },
	{ name: 'Steel 12 L', waterVolumeL: 12.0, ratedBar: 232 },
	{ name: 'Steel 15 L', waterVolumeL: 15.0, ratedBar: 232 },
	{ name: 'Steel 7 L (stage)', waterVolumeL: 7.0, ratedBar: 232 },
	{ name: 'Steel 3 L (pony)', waterVolumeL: 3.0, ratedBar: 232 },
]

// Cascade/storage bank cylinders. UN/EN sizes are water-volume by definition;
// the rated pressures are the common service ratings for these bottles.
export const STORAGE_TANKS: TankPreset[] = [
	{ name: 'UN 45 L (310 bar)', waterVolumeL: 45, ratedBar: 310 },
	{ name: 'UN 50 L (300 bar)', waterVolumeL: 50, ratedBar: 300 },
	{ name: 'UN 50 L (232 bar)', waterVolumeL: 50, ratedBar: 232 },
]

// Industrial O2/He supply bottles. Values from Airgas / Praxair (Linde NA) /
// Messer spec sheets. "T" and "K" follow the Airgas/Praxair US convention;
// Linde/Messer (EU) rate the equivalent bottles by litre.
// Sources: Airgas Specialty Gas Cylinder Dimensions (ap003.pdf), Airgas Size
// Comparison Chart (ap004.pdf), Praxair/Linde Cylinders & Containers, Messer
// Reine Gase 2021.
export const INDUSTRIAL_TANKS: TankPreset[] = [
	{ name: 'T cylinder (Airgas 300)', waterVolumeL: 49, ratedBar: 165 },
	{ name: 'K cylinder (Airgas 200)', waterVolumeL: 43.8, ratedBar: 156 },
	{ name: 'Linde/Messer 50 L (200 bar)', waterVolumeL: 50, ratedBar: 200 },
	{ name: 'Linde/Messer 50 L (300 bar)', waterVolumeL: 50, ratedBar: 300 },
]

export interface MixPreset {
	name: string
	fo2: number
	fhe: number
}

// Free-gas (air) capacity in surface litres, ideal-gas estimate at the
// cylinder's working pressure: water volume × rated pressure (bar gauge ≈
// atmospheres). The actual fill pressure may differ from the working pressure.
export function freeGasLiters(tank: TankPreset): number {
	return tank.waterVolumeL * tank.ratedBar
}

export interface BoosterPreset {
	name: string
	ratio: number
	twoStage: boolean
	// Drive-air consumed per cycle (free L) and max drive-air consumption (free
	// L/min). Model-specific and not reliably published per model, so default 0
	// ("unknown"); the calculator seeds an editable field the user fills from the
	// booster datasheet. Two-stage flag from the model designation.
	vdPerCycleL: number
	driveMaxLpm: number
}

// Air-driven gas boosters. The ratio is the nominal pressure (area) ratio,
// inferred from each model's designation (the model number is the ratio — the
// standard naming convention). Sources: Haskel AG-series product pages
// (haskel.com / fluidprocesscontrol.com); USUN dive boosters (diverightinscuba.com/usun).
// The USUN GBT/SBT 15/40 are TWO-STAGE (1st stage 15:1, output stage 40:1);
// our single-ratio model approximates them by the 40:1 output stage, so the
// drive-gas estimate for those is rough. Other brands/models: use Custom.
export const BOOSTERS: BoosterPreset[] = [
	{ name: 'Haskel AG-30', ratio: 30, twoStage: false, vdPerCycleL: 0, driveMaxLpm: 0 },
	{ name: 'Haskel AG-50', ratio: 50, twoStage: false, vdPerCycleL: 0, driveMaxLpm: 0 },
	{ name: 'Haskel AG-62', ratio: 62, twoStage: false, vdPerCycleL: 0, driveMaxLpm: 0 },
	{ name: 'Haskel AG-75', ratio: 75, twoStage: false, vdPerCycleL: 0, driveMaxLpm: 0 },
	{ name: 'Haskel AG-102', ratio: 102, twoStage: false, vdPerCycleL: 0, driveMaxLpm: 0 },
	{ name: 'Haskel AG-152', ratio: 152, twoStage: false, vdPerCycleL: 0, driveMaxLpm: 0 },
	{ name: 'USUN XB30 / XBD30', ratio: 30, twoStage: false, vdPerCycleL: 0, driveMaxLpm: 0 },
	{ name: 'USUN GB40 / GBD40', ratio: 40, twoStage: false, vdPerCycleL: 0, driveMaxLpm: 0 },
	{ name: 'USUN GB40-OL-F (O₂)', ratio: 40, twoStage: false, vdPerCycleL: 0, driveMaxLpm: 0 },
	{ name: 'USUN GBT 15/40 (2-stage)', ratio: 40, twoStage: true, vdPerCycleL: 0, driveMaxLpm: 0 },
	{ name: 'USUN SBT 15/40 (2-stage)', ratio: 40, twoStage: true, vdPerCycleL: 0, driveMaxLpm: 0 },
]

export const MIXES: MixPreset[] = [
	{ name: 'Air', fo2: 0.21, fhe: 0 },
	{ name: 'EAN28', fo2: 0.28, fhe: 0 },
	{ name: 'EAN32', fo2: 0.32, fhe: 0 },
	{ name: 'EAN36', fo2: 0.36, fhe: 0 },
	{ name: 'EAN40', fo2: 0.4, fhe: 0 },
	{ name: 'EAN50', fo2: 0.5, fhe: 0 },
	{ name: 'EAN80', fo2: 0.8, fhe: 0 },
	{ name: 'Oxygen 100%', fo2: 1.0, fhe: 0 },
	{ name: 'Trimix 21/35', fo2: 0.21, fhe: 0.35 },
	{ name: 'Trimix 18/45', fo2: 0.18, fhe: 0.45 },
	{ name: 'Trimix 15/55', fo2: 0.15, fhe: 0.55 },
	{ name: 'Trimix 10/70', fo2: 0.1, fhe: 0.7 },
]
