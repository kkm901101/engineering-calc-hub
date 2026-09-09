export type PhaseType = 'dc' | 'ac_single' | 'ac_three';
export type ConductorMaterial = 'copper' | 'aluminum';
export type DistanceUnit = 'meters' | 'feet';

export interface WireSpec {
  awg: string;
  mm2: number;
  resistanceCopperPerKm: number;   // ohm/km at 75°C
  resistanceAluminumPerKm: number; // ohm/km at 75°C
}

export const WIRE_SPECS: WireSpec[] = [
  { awg: '14 AWG', mm2: 2.08, resistanceCopperPerKm: 10.1, resistanceAluminumPerKm: 16.6 },
  { awg: '12 AWG', mm2: 3.31, resistanceCopperPerKm: 6.36, resistanceAluminumPerKm: 10.4 },
  { awg: '10 AWG', mm2: 5.26, resistanceCopperPerKm: 3.99, resistanceAluminumPerKm: 6.56 },
  { awg: '8 AWG',  mm2: 8.37, resistanceCopperPerKm: 2.52, resistanceAluminumPerKm: 4.13 },
  { awg: '6 AWG',  mm2: 13.3, resistanceCopperPerKm: 1.58, resistanceAluminumPerKm: 2.60 },
  { awg: '4 AWG',  mm2: 21.2, resistanceCopperPerKm: 0.99, resistanceAluminumPerKm: 1.63 },
  { awg: '2 AWG',  mm2: 33.6, resistanceCopperPerKm: 0.62, resistanceAluminumPerKm: 1.02 },
  { awg: '1/0',    mm2: 53.5, resistanceCopperPerKm: 0.39, resistanceAluminumPerKm: 0.64 },
  { awg: '2/0',    mm2: 67.4, resistanceCopperPerKm: 0.31, resistanceAluminumPerKm: 0.51 },
  { awg: '4/0',    mm2: 107,  resistanceCopperPerKm: 0.19, resistanceAluminumPerKm: 0.32 },
  { awg: '250 kcmil', mm2: 127, resistanceCopperPerKm: 0.17, resistanceAluminumPerKm: 0.27 }
];

export interface VoltageDropInput {
  phase: PhaseType;
  voltage: number;
  current: number;
  distance: number;
  distanceUnit: DistanceUnit;
  material: ConductorMaterial;
  targetMaxDropPercent?: number;
}

export interface VoltageDropResult {
  voltageDrop: number;
  voltageAtLoad: number;
  percentageDrop: number;
  powerLoss: number;
  isAcceptable: boolean;
  recommendedWire: WireSpec;
}

export function calculateVoltageDrop(input: VoltageDropInput): VoltageDropResult {
  const distanceKm = input.distanceUnit === 'feet' 
    ? (input.distance * 0.3048) / 1000 
    : input.distance / 1000;

  const multiplier = input.phase === 'ac_three' ? Math.sqrt(3) : 2.0;
  const targetDrop = input.targetMaxDropPercent ?? 3.0;

  let chosenWire = WIRE_SPECS[0];
  let finalVdrop = 0;
  let finalDropPercent = 0;

  for (const wire of WIRE_SPECS) {
    const rPerKm = input.material === 'copper' 
      ? wire.resistanceCopperPerKm 
      : wire.resistanceAluminumPerKm;

    const totalR = rPerKm * distanceKm;
    const vDrop = multiplier * input.current * totalR;
    const dropPercent = (vDrop / input.voltage) * 100;

    chosenWire = wire;
    finalVdrop = vDrop;
    finalDropPercent = dropPercent;

    if (dropPercent <= targetDrop) {
      break;
    }
  }

  const vAtLoad = Math.max(0, input.voltage - finalVdrop);
  const powerLossWatts = input.phase === 'ac_three'
    ? 3 * Math.pow(input.current, 2) * (chosenWire.resistanceCopperPerKm * distanceKm)
    : 2 * Math.pow(input.current, 2) * (chosenWire.resistanceCopperPerKm * distanceKm);

  return {
    voltageDrop: finalVdrop,
    voltageAtLoad: vAtLoad,
    percentageDrop: finalDropPercent,
    powerLoss: powerLossWatts,
    isAcceptable: finalDropPercent <= targetDrop,
    recommendedWire: chosenWire
  };
}
