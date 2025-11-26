import { Part, PartCategory, FlightProfile, LandingMethod } from './types';

export const PARTS_CATALOG: Part[] = [
  // Propulsion
  {
    id: 'prop_chem_1',
    name: 'スタンダード化学スラスタ',
    category: PartCategory.PROPULSION,
    description: '信頼性の高い標準的な化学エンジン。バランスが良い。',
    mass: 50,
    cost: 10,
    reliability: 98,
    thrust: 500,
    powerConsumption: 10,
    icon: '🚀'
  },
  {
    id: 'prop_ion_1',
    name: 'イオンエンジン「隼」',
    category: PartCategory.PROPULSION,
    description: '燃費は最高だが推力が弱い。時間がかかるが軽量化に貢献。',
    mass: 20,
    cost: 25,
    reliability: 95,
    thrust: 50,
    powerConsumption: 150,
    icon: '✨'
  },
  {
    id: 'prop_high_1',
    name: 'ハイパワーロケット',
    category: PartCategory.PROPULSION,
    description: '強力な推力を持つが、重く、燃料消費も激しい。',
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
    name: '展開式ソーラーパネル',
    category: PartCategory.POWER,
    description: '標準的な太陽電池パドル。',
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
    description: '太陽から遠くても安定して電力を供給するが、非常に高価。',
    mass: 30,
    cost: 40,
    reliability: 99,
    powerGeneration: 80,
    icon: '☢️'
  },
  {
    id: 'pwr_solar_adv',
    name: '薄膜高効率ソーラー',
    category: PartCategory.POWER,
    description: '最新技術を用いた軽量かつ高出力なパネル。耐久性に難あり。',
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
    description: '標準的な通信速度。地球との通信を確保する。',
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
    description: '超高速通信が可能だが、正確な姿勢制御が必要。',
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
    description: '弾丸を撃ち込み、舞い上がった砂を採取する方式。',
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
    description: '地中深くのサンプルを採取できるが、機構が複雑。',
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
    description: '表面に押し付けて塵を吸着する。確実だが量は少ない。',
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
    description: '宇宙線に強い設計。処理能力は控えめ。',
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
    description: 'トラブルを自律判断で回避できるが、電力食い。',
    mass: 8,
    cost: 35,
    reliability: 92,
    powerConsumption: 50,
    icon: '🧠'
  }
];

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