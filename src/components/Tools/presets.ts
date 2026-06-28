import { mixZ } from '../../lib/diveMath/compressibility'

export interface TankPreset {
	name: string
	waterVolumeL: number
	ratedBar: number
}

// Common scuba cylinders — water (internal) volume in litres, rated pressure in
// bar. Cylinder names are NOMINAL capacity, not exact: e.g. the AL80 is really
// 77.4 cu ft (11.1 L × 3000 psi), so a free-gas figure from water volume ×
// working pressure is an ideal-gas estimate that over-states ~5% at HP. Sources:
// Luxfer & Catalina (aluminum, all 3000 psi / 206.84 bar — Catalina S80 ≡ Luxfer
// AL80 on the numbers); Faber & Worthington/PST (steel). NOTE: HP117/HP133 are
// Faber, HP119/HP130 are Worthington — same nominal class, different cylinders.
// HP rated 3442 psi (237.32 bar); LP commonly filled to +10% (2640 psi / 182 bar).
// Metric NL sizes are water-volume by definition.
const AL_BAR = 206.84 // 3000 psi
const HP_BAR = 237.32 // 3442 psi
const LP_BAR = 182.0 // 2640 psi (+10%)
export const DIVE_TANKS: TankPreset[] = [
	{ name: 'AL80 (S80)', waterVolumeL: 11.1, ratedBar: AL_BAR },
	{ name: 'AL63 (S63)', waterVolumeL: 9.0, ratedBar: AL_BAR },
	{ name: 'AL40', waterVolumeL: 5.7, ratedBar: AL_BAR },
	{ name: 'AL30 (pony)', waterVolumeL: 4.3, ratedBar: AL_BAR },
	{ name: 'AL19 (pony)', waterVolumeL: 2.9, ratedBar: AL_BAR },
	{ name: 'HP100 (Faber)', waterVolumeL: 12.9, ratedBar: HP_BAR },
	{ name: 'HP117 (Faber)', waterVolumeL: 15.0, ratedBar: HP_BAR },
	{ name: 'HP119 (Worthington)', waterVolumeL: 15.0, ratedBar: HP_BAR },
	{ name: 'HP120 (Faber)', waterVolumeL: 15.3, ratedBar: HP_BAR },
	{ name: 'HP130 (Worthington)', waterVolumeL: 16.3, ratedBar: HP_BAR },
	{ name: 'HP133 (Faber)', waterVolumeL: 17.0, ratedBar: HP_BAR },
	{ name: 'LP85', waterVolumeL: 12.9, ratedBar: LP_BAR },
	{ name: 'LP95', waterVolumeL: 14.9, ratedBar: LP_BAR },
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

// Free-gas capacity in surface litres at the cylinder's working pressure: water
// volume × rated pressure (bar gauge ≈ atmospheres). Real-gas by default (÷ the
// air compressibility Z at that pressure), which is why a nominal AL80 reads ~79
// not 81; pass useRealGas: false for the ideal estimate. The actual fill pressure
// may differ from the working pressure.
export function freeGasLiters(
	tank: TankPreset,
	opts?: { useRealGas?: boolean },
): number {
	const ideal = tank.waterVolumeL * tank.ratedBar
	if (opts?.useRealGas === false) return ideal
	return ideal / mixZ({ fo2: 0.209, fhe: 0, pressureBar: tank.ratedBar })
}

export interface BoosterPreset {
	name: string
	ratio: number
	twoStage: boolean
	// Air-drive piston swept volume per cycle (geometric, litres) and max cycle
	// rate (cycles/min); 0 = unknown. These are pressure-INDEPENDENT, so the
	// calculator derives the actual drive-air per cycle at the (ramping) drive
	// pressure: free L/cycle = driveSweptL × drive-pressure-abs/atm. The calculator
	// seeds them into editable fields. Two-stage flag from the model designation.
	driveSweptL: number
	maxCpm: number
}

// Air-driven gas boosters. The ratio is the nominal pressure (area) ratio,
// inferred from each model's designation (the model number is the ratio — the
// standard naming convention). Sources: Haskel AG-series product pages
// (haskel.com / fluidprocesscontrol.com); USUN dive boosters (diverightinscuba.com/usun).
// The USUN GBT/SBT 15/40 are TWO-STAGE (1st stage 15:1, output stage 40:1);
// our single-ratio model approximates them by the 40:1 output stage, so the
// drive-gas estimate for those is rough. Other brands/models: use Custom.
//
// driveSweptL is the air-drive swept volume PER STROKE (one gas delivery),
// geometric (π/4·bore²·stroke) so it's drive-pressure-independent; the drive air
// per stroke is derived at the running drive pressure. Total drive air over a
// fill is thermodynamic (≈ receiver/supply pressure ratio) and does NOT depend on
// swept volume — the swept volume only sets the cycle (stroke) rate. Double-acting
// ("D", GBT, SBT) deliver on both strokes, so each stroke has the SAME per-stroke
// swept as the single-acting equivalent (same bore); the "D" just buys a higher
// max stroke rate (maxCpm), not a different per-stroke draw or cycle rate.
// • USUN: drive bores XB/GB 100/160 mm, GBT 160 mm, SBT 125 mm, all 120 mm stroke
//   (u-sun.cn, made-in-china, DRIS); ~60 strokes/min single, ~120 double-acting.
// • Haskel AG: ALL six share one 5.75 in (146 mm) air-drive head (OM-3F manual,
//   Nuvair specs) with ~3.6 in stroke (derived, ±10%) → 1.535 L swept, ~60 cpm.
//   The ratio is set by the gas piston, not the drive, so the swept volume is
//   identical across AG-30…AG-152 (AG-62/102/152 are tandem two-stage gas
//   barrels on the same drive).
export const BOOSTERS: BoosterPreset[] = [
	// Shared 5.75 in × 3.6 in drive head → π/4·146²·91.6 ≈ 1.535 L per stroke.
	{ name: 'Haskel AG-30', ratio: 30, twoStage: false, driveSweptL: 1.535, maxCpm: 60 },
	{ name: 'Haskel AG-50', ratio: 50, twoStage: false, driveSweptL: 1.535, maxCpm: 60 },
	{ name: 'Haskel AG-62', ratio: 62, twoStage: false, driveSweptL: 1.535, maxCpm: 60 },
	{ name: 'Haskel AG-75', ratio: 75, twoStage: false, driveSweptL: 1.535, maxCpm: 60 },
	{ name: 'Haskel AG-102', ratio: 102, twoStage: false, driveSweptL: 1.535, maxCpm: 60 },
	{ name: 'Haskel AG-152', ratio: 152, twoStage: false, driveSweptL: 1.535, maxCpm: 60 },
	// XB30/XBD30 share the 100 mm × 120 mm drive (0.942 L/stroke); XBD30 is
	// double-acting → ~2× the max stroke rate.
	{ name: 'USUN XB30', ratio: 30, twoStage: false, driveSweptL: 0.942, maxCpm: 60 },
	{ name: 'USUN XBD30 (double-acting)', ratio: 30, twoStage: false, driveSweptL: 0.942, maxCpm: 120 },
	// GB40/GBD40 share the 160 mm × 120 mm drive (2.412 L/stroke); GBD40 double-acting.
	{ name: 'USUN GB40', ratio: 40, twoStage: false, driveSweptL: 2.412, maxCpm: 60 },
	{ name: 'USUN GBD40 (double-acting)', ratio: 40, twoStage: false, driveSweptL: 2.412, maxCpm: 120 },
	{ name: 'USUN GB40-OL-F (O₂)', ratio: 40, twoStage: false, driveSweptL: 2.412, maxCpm: 60 },
	// GBT 15/40 double-acting, 160 mm → 2.412 L/stroke.
	{ name: 'USUN GBT 15/40 (2-stage)', ratio: 40, twoStage: true, driveSweptL: 2.412, maxCpm: 120 },
	// SBT 15/40 double-acting, 125 mm → 1.473 L/stroke.
	{ name: 'USUN SBT 15/40 (2-stage)', ratio: 40, twoStage: true, driveSweptL: 1.473, maxCpm: 120 },
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
