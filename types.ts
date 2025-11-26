
export enum PartCategory {
  PROPULSION = '推進系',
  POWER = '電源系',
  COMMUNICATION = '通信系',
  SAMPLER = '採取装置',
  COMPUTER = '制御コンピュータ'
}

export interface Part {
  id: string;
  name: string;
  category: PartCategory;
  description: string;
  mass: number; // kg
  cost: number; // M$
  reliability: number; // 0-100%
  icon: string; // Emoji or visual representation
  powerConsumption?: number; // Watts
  powerGeneration?: number; // Watts
  thrust?: number; // Newtons
  dataRate?: number; // Mbps
  sampleCapacity?: number; // grams
}

export enum FlightProfile {
  HOHMANN = 'ホーマン遷移軌道 (省エネ)',
  FAST_TRANSIT = '高速遷移軌道 (短時間)',
  GRAVITY_ASSIST = '地球スイングバイ (超省エネ)'
}

export enum LandingMethod {
  TOUCH_AND_GO = 'タッチ＆ゴー (着地即離脱)',
  FULL_LANDING = '完全着陸 (滞在型)',
  HOVER_DROP = 'ホバリング投下 (非接触)'
}

export interface MissionConfig {
  parts: Record<PartCategory, Part | null>;
  flightProfile: FlightProfile;
  landingMethod: LandingMethod;
}

export interface BilingualText {
  en: string;
  ja: string;
}

export interface SimulationResult {
  success: boolean;
  score: number;
  sampleRetrieved: number; // grams
  missionLog: BilingualText[];
  failureReason?: BilingualText;
  scientificValue: number; // 0-100
  feedback: BilingualText;
}

export type GameStep = 'INTRO' | 'DESIGN' | 'PLAN' | 'SIMULATE';

export type SimulationPhase = 'GAME' | 'LOADING' | 'RESULT';
