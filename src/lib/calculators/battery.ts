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
  /** 포맷팅