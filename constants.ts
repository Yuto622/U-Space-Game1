
import { Part, PartCategory, FlightProfile, LandingMethod } from './types';

// Base templates for procedural generation
export const BASE_PARTS_TEMPLATES: Part[] = [
  // Propulsion
  {
    id: 'prop_chem',
    name: '化学スラスタ',
    category: PartCategory.PROPULSION,
    description: 'バランスが良い、ふつうのエンジン。使いやすい。',
    mass: 50,
    cost: 10,
    reliability: 98,
    thrust: 500,
    powerConsumption: 10,
    icon: '🚀'
  },
  {
    id: 'prop_ion',
    name: 'イオンエンジン',
    category: PartCategory.PROPULSION,
    description: '進むのはゆっくりだけど、燃料がとても長持ちする。',
    mass: 20,
    cost: 25,
    reliability: 95,
    thrust: 50,
    powerConsumption: 150,
    icon: '🌠'
  },
  {
    id: 'prop_high',
    name: 'ハイパワーロケット',
    category: PartCategory.PROPULSION,
    description: 'パワーは最強！でも重くて、燃料もたくさん使う。',
    mass: 120,
    cost: 15,
    reliability: 90,
    thrust: 1500,
    powerConsumption: 20,
    icon: '🔥'
  },

  // Power
  {
    id: 'pwr_solar_basic',
    name: '展開式ソーラー',
    category: PartCategory.POWER,
    description: '太陽の光で電気を作る、ふつうのパネル。',
    mass: 15,
    cost: 5,
    reliability: 95,
    powerGeneration: 100,
    icon: '☀️'
  },
  {
    id: 'pwr_rtg',
    name: 'RTG (原子力電池)',
    category: PartCategory.POWER,
    description: '太陽がなくても電気が作れる原子力電池。とても高い。',
    mass: 30,
    cost: 40,
    reliability: 99,
    powerGeneration: 80,
    icon: '☢️'
  },
  {
    id: 'pwr_solar_adv',
    name: '高効率ソーラー',
    category: PartCategory.POWER,
    description: '軽くてたくさん発電できる最新のパネル。少しこわれやすい。',
    mass: 10,
    cost: 20,
    reliability: 85,
    powerGeneration: 180,
    icon: '💠'
  },

  // Communication
  {
    id: 'comm_xband',
    name: 'Xバンドアンテナ',
    category: PartCategory.COMMUNICATION,
    description: '地球としっかりお話できる、ふつうのアンテナ。',
    mass: 10,
    cost: 8,
    reliability: 97,
    dataRate: 10,
    powerConsumption: 20,
    icon: '📡'
  },
  {
    id: 'comm_laser',
    name: '光通信モジュール',
    category: PartCategory.COMMUNICATION,
    description: 'すごい速さでデータを送れる！でも向きを合わせるのが大変。',
    mass: 25,
    cost: 30,
    reliability: 88,
    dataRate: 100,
    powerConsumption: 60,
    icon: '🔦'
  },

  // Sampler
  {
    id: 'samp_horn',
    name: 'サンプラーホーン',
    category: PartCategory.SAMPLER,
    description: '弾丸を撃ち込んで、砂をまき上げて取る装置。',
    mass: 15,
    cost: 12,
    reliability: 94,
    sampleCapacity: 100,
    powerConsumption: 10,
    icon: '🎺'
  },
  {
    id: 'samp_drill',
    name: 'コアリングドリル',
    category: PartCategory.SAMPLER,
    description: '地面を掘って石を取る。たくさん取れるけど重い。',
    mass: 40,
    cost: 25,
    reliability: 85,
    sampleCapacity: 500,
    powerConsumption: 100,
    icon: '🔩'
  },
  {
    id: 'samp_sticky',
    name: '粘着パッド',
    category: PartCategory.SAMPLER,
    description: 'ペタッとくっつけてチリを取る。軽いけど少ししか取れない。',
    mass: 5,
    cost: 3,
    reliability: 99,
    sampleCapacity: 10,
    powerConsumption: 0,
    icon: '🧽'
  },

  // Computer
  {
    id: 'comp_rad_hard',
    name: '耐放射線CPU',
    category: PartCategory.COMPUTER,
    description: '宇宙の放射線に強くて壊れにくいコンピュータ。',
    mass: 5,
    cost: 20,
    reliability: 99,
    powerConsumption: 15,
    icon: '💾'
  },
  {
    id: 'comp_ai',
    name: '自律AIプロセッサ',
    category: PartCategory.COMPUTER,
    description: '自分で考えてトラブルを解決できるAI。電気をたくさん使う。',
    mass: 8,
    cost: 35,
    reliability: 92,
    powerConsumption: 50,
    icon: '🧠'
  }
];

const SUFFIXES = ['Mk-I', 'Mk-II', 'Type-R', 'Alpha', 'Neo', 'Pro', 'Ver.2', 'カスタム', '改'];

// Helper to vary a number by +/- percentage
const vary = (value: number | undefined, percent: number): number => {
  if (value === undefined) return 0;
  const factor = 1 + (Math.random() * (percent * 2) - percent) / 100;
  return Math.max(1, Math.round(value * factor));
};

export const generateRandomizedParts = (): Part[] => {
  return BASE_PARTS_TEMPLATES.map(template => {
    // Pick a random suffix
    const suffix = SUFFIXES[Math.floor(Math.random() * SUFFIXES.length)];
    const isSpecial = Math.random() > 0.8; // 20% chance for a "Special" part

    const newPart: Part = {
      ...template,
      id: `${template.id}_${Math.random().toString(36).substr(2, 5)}`,
      name: `${template.name} ${suffix}`,
      // Vary stats
      mass: vary(template.mass, 15),
      cost: vary(template.cost, 20),
      // Reliability between 70 and 100, biased towards original
      reliability: Math.min(100, Math.max(70, vary(template.reliability, 5))), 
    };

    // Vary specific stats if they exist
    if (template.powerConsumption) newPart.powerConsumption = vary(template.powerConsumption, 10);
    if (template.powerGeneration) newPart.powerGeneration = vary(template.powerGeneration, 15);
    if (template.thrust) newPart.thrust = vary(template.thrust, 15);
    if (template.dataRate) newPart.dataRate = vary(template.dataRate, 20);
    if (template.sampleCapacity) newPart.sampleCapacity = vary(template.sampleCapacity, 20);

    // "Special" parts might be lighter but more expensive, etc.
    if (isSpecial) {
      newPart.name = `★ ${newPart.name}`;
      newPart.cost = Math.round(newPart.cost * 1.5);
      newPart.mass = Math.round(newPart.mass * 0.8); // Lighter!
      newPart.description = template.description + " (軽量化特別モデル)";
    }

    return newPart;
  });
};

export const FLIGHT_PROFILES_INFO = {
  [FlightProfile.HOHMANN]: "最も燃料効率が良い基本的なルート。火星到着まで約8ヶ月かかる。",
  [FlightProfile.FAST_TRANSIT]: "燃料を大量に使い加速する。放射線被曝リスクを減らせるが、到着時の減速が困難。",
  [FlightProfile.GRAVITY_ASSIST]: "地球や月の重力を利用して加速する。時間はかかるが、非常に少ない燃料で到達可能。"
};

export const LANDING_METHODS_INFO = {
  [LandingMethod.TOUCH_AND_GO]: "一瞬だけ着地してサンプルを回収し、すぐに離脱する。熱制御的に有利。",
  [LandingMethod.FULL_LANDING]: "アンカーを打ち込み完全に着陸する。じっくり調査できるが、転倒リスクがある。",
  [LandingMethod.HOVER_DROP]: "着陸せず、高度を維持して採取装置だけを下ろす。高度な制御が必要。"
};

export const SAMPLE_TIERS = [
  { maxScore: 30, name: '謎の砂 (ハズレ)', icon: '🌫️' },
  { maxScore: 60, name: 'フォボスの砂', icon: '🏜️' },
  { maxScore: 85, name: '貴重な小石', icon: '🪨' },
  { maxScore: 101, name: '未知の結晶', icon: '💎' },
];
