export type PowerUnit = 'kW' | 'W' | 'HP';
export type TorqueUnit = 'Nm' | 'kNm' | 'lb_ft' | 'lb_in' | 'kgf_m';
export type SpeedUnit = 'RPM' | 'rad_s';

export interface MotorCalculationInputs {
  solveFor: 'power' | 'torque' | 'speed';
  rpm?: number;
  torque?: number;
  torqueUnit?: TorqueUnit;
  power?: number;
  powerUnit?: PowerUnit;
}

export interface MotorCalculationResult {
  rpm: number;
  radPerSec: number;
  torqueNm: number;
  torqueLbFt: number;
  torqueLbIn: number;
  powerKw: number;
  powerHp: number;
  powerWatts: number;
}

const TORQUE_TO_NM: Record<TorqueUnit, number> = {
  Nm: 1.0,
  kNm: 1000.0,
  lb_ft: 1.355818,
  lb_in: 0.112985,
  kgf_m: 9.80665,
};

const POWER_TO_KW: Record<PowerUnit, number> = {
  kW: 1.0,
  W: 0.001,
  HP: 0.74569987,
};

export function calculateMotor(inputs: MotorCalculationInputs): MotorCalculationResult {
  let rpm = inputs.rpm ?? 0;
  let torqueNm = 0;
  let powerKw = 0;

  const torqueUnit = inputs.torqueUnit ?? 'Nm';
  const powerUnit = inputs.powerUnit ?? 'kW';

  if (inputs.torque !== undefined) {
    torqueNm = inputs.torque * TORQUE_TO_NM[torqueUnit];
  }
  if (inputs.power !== undefined) {
    powerKw = inputs.power * POWER_TO_KW[powerUnit];
  }

  const CONSTANT = 9549.2965855;

  if (inputs.solveFor === 'power') {
    powerKw = (torqueNm * rpm) / CONSTANT;
  } else if (inputs.solveFor === 'torque') {
    torqueNm = rpm > 0 ? (powerKw * CONSTANT) / rpm : 0;
  } else if (inputs.solveFor === 'speed') {
    rpm = torqueNm > 0 ? (powerKw * CONSTANT) / torqueNm : 0;
  }

  const radPerSec = (rpm * 2 * Math.PI) / 60;
  const powerWatts = powerKw * 1000;
  const powerHp = powerKw / POWER_TO_KW['HP'];

  return {
    rpm: Number(rpm.toFixed(1)),
    radPerSec: Number(radPerSec.toFixed(2)),
    torqueNm: Number(torqueNm.toFixed(2)),
    torqueLbFt: Number((torqueNm / TORQUE_TO_NM['lb_ft']).toFixed(2)),
    torqueLbIn: Number((torqueNm / TORQUE_TO_NM['lb_in']).toFixed(2)),
    powerKw: Number(powerKw.toFixed(3)),
    powerHp: Number(powerHp.toFixed(2)),
    powerWatts: Number(powerWatts.toFixed(1)),
  };
}
