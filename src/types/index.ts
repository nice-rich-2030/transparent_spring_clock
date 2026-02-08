import * as THREE from 'three';

export interface WatchPart {
  id: string;
  name: string;
  nameEn: string;
  mesh: THREE.Object3D;
  description: string;
  parent?: WatchPart;
  rotationAxis?: THREE.Vector3;
  rotationSpeed?: number;
  transparency?: number;
  emissive?: boolean;
}

export interface Gear {
  id: string;
  name: string;
  teeth: number;
  radius: number;
  thickness: number;
  connectedTo: string[];
  gearRatio: number;
  mesh: THREE.Mesh;
  rotationDirection: 1 | -1;
  phaseOffset: number;
}

export interface GearTrainConfig {
  id: string;
  name: string;
  teeth: number;
  radius: number;
  thickness: number;
  position: THREE.Vector3;
  rotationDirection: 1 | -1;
}

export interface TimeState {
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
}

export type CameraPreset = 'front' | 'back' | 'side' | 'movement';

export interface CameraPresetConfig {
  position: THREE.Vector3;
  target: THREE.Vector3;
}

export interface AppConfig {
  performanceMode: boolean;
  debugMode: boolean;
  autoRotate: boolean;
  wireframe: boolean;
  showAxes: boolean;
}

export const DEFAULT_CONFIG: AppConfig = {
  performanceMode: false,
  debugMode: false,
  autoRotate: false,
  wireframe: false,
  showAxes: false
};

export const PART_DESCRIPTIONS: Record<string, { name: string; nameEn: string; description: string }> = {
  barrel: {
    name: '香箱（バレル）',
    nameEn: 'Barrel',
    description: '主ゼンマイを収納する円柱形のケース。巻き上げられたゼンマイがほどける力で歯車を回転させ、時計の動力源となる。'
  },
  mainspring: {
    name: '主ゼンマイ',
    nameEn: 'Mainspring',
    description: '香箱内に収められた渦巻き状の金属バネ。巻き上げによりエネルギーを蓄積し、ほどける力で時計を駆動する。'
  },
  gear_center: {
    name: '二番車（中心歯車）',
    nameEn: 'Center Wheel',
    description: '香箱車から動力を受け取り、分針を駆動する歯車。1時間で1回転する。'
  },
  gear_third: {
    name: '三番車',
    nameEn: 'Third Wheel',
    description: '二番車と四番車を連結する中間歯車。動力を効率的に伝達する。'
  },
  gear_fourth: {
    name: '四番車',
    nameEn: 'Fourth Wheel',
    description: '秒針を駆動する歯車。1分で1回転する。'
  },
  gear_escape: {
    name: 'ガンギ車',
    nameEn: 'Escape Wheel',
    description: '脱進機の一部で、特殊な形状の歯を持つ。アンクルと噛み合い、エネルギーを一定速度で解放する。'
  },
  anchor: {
    name: 'アンクル',
    nameEn: 'Anchor',
    description: 'T字型のレバーで、ガンギ車の動きを制御する。てんぷの振動と連動して動作する。'
  },
  pallet_stones: {
    name: '爪石',
    nameEn: 'Pallet Stones',
    description: 'アンクルに取り付けられた人工ルビー。ガンギ車の歯と接触し、摩擦を軽減しながら動力を伝達する。'
  },
  balance: {
    name: 'てんぷ',
    nameEn: 'Balance Wheel',
    description: '時計の心臓部。ひげゼンマイと連動して規則正しく振動し、正確な時を刻む調速機の中心。'
  },
  hairspring: {
    name: 'ひげゼンマイ',
    nameEn: 'Hairspring',
    description: 'てんぷに取り付けられた極細の渦巻きバネ。てんぷの振動を制御し、時計の精度を決定する。'
  },
  rotor: {
    name: 'ローター（磁石）',
    nameEn: 'Rotor',
    description: 'スプリングドライブの発電機構。高速回転する磁石がコイルに電力を誘起する。'
  },
  coil: {
    name: 'コイル',
    nameEn: 'Coil',
    description: 'ローターの回転による磁束変化で電力を生成。また電磁ブレーキとしてローターの速度を制御する。'
  },
  ic: {
    name: 'IC（集積回路）',
    nameEn: 'IC',
    description: '水晶振動子からの信号を基準に、電磁ブレーキを制御して精密な時刻を維持する頭脳。'
  },
  quartz: {
    name: '水晶振動子',
    nameEn: 'Quartz Crystal',
    description: '1秒間に32,768回振動する水晶。この高精度な振動がスプリングドライブの時刻精度を保証する。'
  },
  hour_hand: {
    name: '時針',
    nameEn: 'Hour Hand',
    description: '12時間で1周する短い針。現在の時刻（時）を示す。'
  },
  minute_hand: {
    name: '分針',
    nameEn: 'Minute Hand',
    description: '1時間で1周する長い針。現在の時刻（分）を示す。'
  },
  second_hand: {
    name: '秒針',
    nameEn: 'Second Hand',
    description: '1分で1周する細い針。スプリングドライブ特有のスイープ運針で滑らかに動く。'
  },
  dial: {
    name: '文字盤',
    nameEn: 'Dial',
    description: '時刻を読み取るための目盛りと数字が配置された盤面。'
  },
  case: {
    name: 'ケース',
    nameEn: 'Case',
    description: 'ムーブメントを保護する外装。防水・防塵機能を持つ。'
  },
  crystal: {
    name: '風防（サファイアクリスタル）',
    nameEn: 'Crystal',
    description: '文字盤を保護する透明なガラス。傷がつきにくいサファイアクリスタル製。'
  },
  jewel: {
    name: '軸受け石',
    nameEn: 'Jewel Bearing',
    description: '歯車の軸受けに使用される人工ルビー/サファイア。摩擦を軽減し、耐久性を向上させる。'
  }
};
