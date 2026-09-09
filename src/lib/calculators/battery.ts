/**
 * 배터리 런타임 및 방전 시간 연산 모듈
 * 선형 단순 계산 및 Peukert's Law 기반 정밀 계산 지원
 */

export interface BatteryInputs {
  /** 배터리 용량 값 (예: 100) */
  capacity: number;
  /** 용량 단위 ('Ah' | 'mAh') */
  capacityUnit: 'Ah' | 'mAh';
  /** 공칭 전압 (V, 기본값: 12) */
  voltage: number;
  /** 부하 값 (전류 또는 전력) */
  loadValue: number;
  /** 부하 단위 ('A' | 'mA' | 'W') */
  loadUnit: 'A' | 'mA' | 'W';
  /** 배터리 방전 심도 DoD 백분율 (0 ~ 100, 예: 리튬 80~90%, 납축 50%) */
  dischargeDepth: number;
  /** 시스템/인버터 변환 효율 백분율 (1 ~ 100, 기본값 90%) */
  efficiency: number;
  /** Peukert 상수 (기본값: 1.05 ~ 1.3, 선형 단순 계산 시 1.0) */
  peukertExponent?: number;
  /** Peukert 기준 방전 시간률 (시간, 통상 20h) */
  ratedDischargeHours?: number;
}

export interface BatteryResult {
  /** 총 런타임 (시간, 소수점) */
  runtimeHours: number;
  /** 런타임 분 단위 변환 */
  runtimeMinutes: number;
  /** 포맷팅된 문자열 (예: "8시간 30분") */
  formattedRuntime: string;
  /** 방전 전류 (A) */
  dischargeCurrentA: number;
  /** 실질 가용 용량 (Ah) */
  usableCapacityAh: number;
}

export function calculateBattery(inputs: BatteryInputs): BatteryResult {
  const {
    capacity,
    capacityUnit,
    voltage,
    loadValue,
    loadUnit,
    dischargeDepth,
    efficiency,
    peukertExponent = 1.0,
    ratedDischargeHours = 20,
  } = inputs;

  // 1. 용량을 Ah 단위로 통일
  let capacityAh = capacityUnit === 'mAh' ? capacity / 1000 : capacity;

  // 2. 부하를 방전 전류 (A) 단위로 변환
  let dischargeCurrentA = 0;
  if (loadUnit === 'A') {
    dischargeCurrentA = loadValue;
  } else if (loadUnit === 'mA') {
    dischargeCurrentA = loadValue / 1000;
  } else if (loadUnit === 'W') {
    dischargeCurrentA = voltage > 0 ? loadValue / voltage : 0;
  }

  // 3. DoD 및 효율 적용한 가용 용량 (단순 선형 계산용)
  const usableCapacityAh = capacityAh * (dischargeDepth / 100) * (efficiency / 100);

  let runtimeHours = 0;

  if (dischargeCurrentA > 0) {
    if (peukertExponent > 1.0) {
      // Peukert's Law 적용
      // t = H * (C / (I * H))^k
      // 여기에 효율 및 DoD 비율 적용
      const C_eff = capacityAh * (dischargeDepth / 100) * (efficiency / 100);
      const ratio = C_eff / (dischargeCurrentA * ratedDischargeHours);
      if (ratio > 0) {
        runtimeHours = ratedDischargeHours * Math.pow(ratio, peukertExponent);
      }
    } else {
      // 단순 선형 계산
      runtimeHours = usableCapacityAh / dischargeCurrentA;
    }
  }

  const runtimeMinutes = runtimeHours * 60;
  const hoursInt = Math.floor(runtimeHours);
  const minsInt = Math.round((runtimeHours - hoursInt) * 60);

  let formattedRuntime = '';
  if (hoursInt > 0) {
    formattedRuntime += `${hoursInt}시간 `;
  }
  formattedRuntime += `${minsInt}분`;

  return {
    runtimeHours: Number(runtimeHours.toFixed(2)),
    runtimeMinutes: Number(runtimeMinutes.toFixed(0)),
    formattedRuntime,
    dischargeCurrentA: Number(dischargeCurrentA.toFixed(3)),
    usableCapacityAh: Number(usableCapacityAh.toFixed(2)),
  };
}
