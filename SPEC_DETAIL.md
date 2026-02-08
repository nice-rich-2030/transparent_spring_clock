# 観賞用スプリング式時計 3Dビューア 詳細設計書 (SPEC_DETAIL.md)

---

## 2.1 ファイルごとの実装概要

---

### 2.1.1 main.ts

**役割**: アプリケーションのエントリーポイント。DOM読込完了後に各マネージャーを初期化。

**処理フロー**:
```
[DOMContentLoaded]
    ↓
[WebGL対応チェック]
    ↓ 対応
[SceneManager初期化]
    ↓
[WatchAssembly生成・シーン追加]
    ↓
[UIManager初期化]
    ↓
[Renderer.startAnimationLoop()]
```

**主要な関数/メソッド**:
| 関数名 | 引数 | 戻り値 | 説明 |
|--------|------|--------|------|
| `init()` | なし | void | アプリ初期化のメイン関数 |
| `checkWebGLSupport()` | なし | boolean | WebGL2対応確認 |

**他ファイルとの連携**:
```
main.ts
  ├── SceneManager.ts（シーン管理）
  ├── WatchAssembly.ts（時計生成）
  ├── UIManager.ts（UI管理）
  └── Renderer.ts（描画開始）
```

**実装時の注意点**:
- WebGL非対応時はエラーメッセージを表示し、処理を中断
- 初期化順序を厳守（シーン→時計→UI→描画開始）

---

### 2.1.2 scene/SceneManager.ts

**役割**: three.js の Scene、Camera、Light、環境マップを一元管理。

**処理フロー**:
```
[constructor]
    ↓
[Scene生成] → 背景色設定（暗い青灰色）
    ↓
[PerspectiveCamera生成] → 初期位置設定
    ↓
[ライティング設定]
    ├── AmbientLight（環境光）
    ├── DirectionalLight（主光源）
    ├── PointLight x 2（補助光）
    └── RectAreaLight（反射用）
    ↓
[HDR環境マップ読込]
    ↓
[シーン準備完了]
```

**主要な関数/メソッド**:
| 関数名 | 引数 | 戻り値 | 説明 |
|--------|------|--------|------|
| `constructor(container: HTMLElement)` | コンテナ要素 | SceneManager | 初期化 |
| `getScene()` | なし | THREE.Scene | シーン取得 |
| `getCamera()` | なし | THREE.PerspectiveCamera | カメラ取得 |
| `setupLighting()` | なし | void | ライト配置 |
| `loadEnvironmentMap(url: string)` | HDRファイルパス | Promise<void> | 環境マップ読込 |
| `updateAspect(width, height)` | ピクセルサイズ | void | アスペクト比更新 |

**他ファイルとの連携**:
```
SceneManager.ts
  ├── Renderer.ts（シーン・カメラを渡す）
  ├── WatchAssembly.ts（シーンに時計を追加）
  └── CameraController.ts（カメラを渡す）
```

**実装時の注意点**:
- 環境マップはPMREMGeneratorで処理し、半透明マテリアルの反射に使用
- ライトの強度は半透明部品が見えやすいバランスに調整

---

### 2.1.3 scene/Renderer.ts

**役割**: WebGLRendererの設定、アニメーションループ、リサイズ対応。

**処理フロー**:
```
[constructor]
    ↓
[WebGLRenderer生成]
    ├── antialias: true
    ├── alpha: true
    ├── toneMapping: ACESFilmicToneMapping
    └── outputEncoding: sRGBEncoding
    ↓
[リサイズイベント登録]
    ↓
[startAnimationLoop()]
    ↓
[毎フレーム]
    ├── TimeController.update()
    ├── WatchAssembly.update(deltaTime)
    ├── CameraController.update()
    └── renderer.render(scene, camera)
```

**主要な関数/メソッド**:
| 関数名 | 引数 | 戻り値 | 説明 |
|--------|------|--------|------|
| `constructor(sceneManager, container)` | マネージャ、コンテナ | Renderer | 初期化 |
| `startAnimationLoop()` | なし | void | アニメーション開始 |
| `stopAnimationLoop()` | なし | void | アニメーション停止 |
| `onResize()` | なし | void | リサイズ時処理 |
| `getDeltaTime()` | なし | number | 前フレームからの経過秒 |

**他ファイルとの連携**:
```
Renderer.ts
  ├── SceneManager.ts（シーン・カメラ取得）
  ├── TimeController.ts（時刻更新）
  ├── WatchAssembly.ts（部品アニメーション）
  └── CameraController.ts（カメラ更新）
```

**実装時の注意点**:
- 半透明描画のため `renderer.sortObjects = true` を設定
- パフォーマンスモード時は `pixelRatio` を下げる

---

### 2.1.4 watch/WatchAssembly.ts

**役割**: 時計全体の組み立て。全部品を生成・配置し、親子関係を構築。

**処理フロー**:
```
[constructor]
    ↓
[Group生成（時計ルート）]
    ↓
[各部品クラスをインスタンス化]
    ├── Case（ケース・風防・文字盤）
    ├── Barrel（香箱）
    ├── GearTrain（輪列）
    ├── Escapement（脱進機）
    ├── Balance（調速機）
    ├── Generator（発電機構）
    ├── Quartz（水晶振動子・IC）
    └── Hands（針）
    ↓
[各部品をGroupに追加]
    ↓
[部品リストを保持（情報表示用）]
```

**主要な関数/メソッド**:
| 関数名 | 引数 | 戻り値 | 説明 |
|--------|------|--------|------|
| `constructor()` | なし | WatchAssembly | 時計組立 |
| `getGroup()` | なし | THREE.Group | 時計全体のグループ |
| `update(deltaTime, timeState)` | 経過時間、時刻 | void | 全部品更新 |
| `getPartById(id: string)` | 部品ID | WatchPart | 部品取得 |
| `getAllParts()` | なし | WatchPart[] | 全部品リスト |
| `highlightPart(id: string)` | 部品ID | void | 部品ハイライト |
| `resetHighlight()` | なし | void | ハイライト解除 |

**他ファイルとの連携**:
```
WatchAssembly.ts
  ├── 全parts/*.ts（部品生成）
  ├── TimeController.ts（時刻データ受取）
  ├── SceneManager.ts（シーンに追加）
  └── UIManager.ts（部品情報提供）
```

**部品配置図（Z軸: 奥行き）**:
```
[正面図]                    [側面図]
    12                      風防
   ╱  ╲                      │
  9    3  ← 文字盤          ┌─┴─┐ ← 文字盤
   ╲  ╱                     │ 針 │
    6                       ├───┤ ← 歯車層
                            │ 香 │
                            │ 箱 │
                            └───┘ ← ケース裏
```

**実装時の注意点**:
- 部品の配置座標は時計の中心を原点(0, 0, 0)とする
- 部品間の干渉を避けるため、Z座標（奥行き）を細かく設定

---

### 2.1.5 watch/parts/Barrel.ts

**役割**: 香箱（バレル）と主ゼンマイの3Dモデル生成・アニメーション。

**処理フロー**:
```
[constructor]
    ↓
[香箱外筒] → CylinderGeometry + 半透明マテリアル
    ↓
[主ゼンマイ] → SpiralGeometry（カスタム） + 金属マテリアル
    ↓
[軸] → CylinderGeometry（細い円柱）
    ↓
[Groupにまとめる]
```

**主要な関数/メソッド**:
| 関数名 | 引数 | 戻り値 | 説明 |
|--------|------|--------|------|
| `constructor(material)` | マテリアル | Barrel | 香箱生成 |
| `getMesh()` | なし | THREE.Group | メッシュ取得 |
| `update(deltaTime)` | 経過時間 | void | ゼンマイ巻き戻しアニメーション |
| `getPartInfo()` | なし | WatchPart | 部品情報 |

**ゼンマイ形状（カスタムジオメトリ）**:
```
[上面図]
    ┌─────────┐
   ╱   ╱───╲   ╲
  │   │ 軸 │   │  ← 渦巻き状のバネ
   ╲   ╲───╱   ╱
    └─────────┘
```

**実装時の注意点**:
- ゼンマイはTubeGeometryで渦巻きカーブを生成
- ほどける動きは `rotation.z` の変化で表現

---

### 2.1.6 watch/parts/GearTrain.ts

**役割**: 輪列（5枚の歯車）の生成・連動回転アニメーション。

**歯車構成**:
| # | 名称 | 歯数 | 役割 | 回転方向 |
|---|------|------|------|----------|
| 1 | 香箱車 | 80 | 香箱と一体、動力を伝達 | 時計回り |
| 2 | 二番車 | 64/10 | 分針を駆動 | 反時計回り |
| 3 | 三番車 | 75/10 | 中間歯車 | 時計回り |
| 4 | 四番車 | 80/10 | 秒針を駆動 | 反時計回り |
| 5 | ガンギ車連結 | 20 | 脱進機へ接続 | 時計回り |

**処理フロー**:
```
[constructor]
    ↓
[各歯車を生成]
    ├── createGear(teeth, radius, thickness)
    └── 歯車形状 = 外周に歯を配置した円盤
    ↓
[ギア比を計算]
    ↓
[各歯車を配置（軸をずらして配置）]
```

**主要な関数/メソッド**:
| 関数名 | 引数 | 戻り値 | 説明 |
|--------|------|--------|------|
| `constructor(material)` | マテリアル | GearTrain | 輪列生成 |
| `createGear(teeth, radius, thickness)` | パラメータ | THREE.Mesh | 歯車メッシュ生成 |
| `update(timeState)` | 時刻 | void | ギア比に基づき回転 |
| `getGears()` | なし | Gear[] | 歯車リスト |

**歯車形状（ExtrudeGeometry使用）**:
```
[歯車断面]
   ╱╲   ╱╲   ╱╲
  │  │ │  │ │  │
  ╰──╯ ╰──╯ ╰──╯
       ○ ← 軸穴
```

**実装時の注意点**:
- 歯車の歯は `Shape` + `ExtrudeGeometry` で作成
- 噛み合う歯車は逆方向に回転、歯が噛み合う位相を調整

---

### 2.1.7 watch/parts/Escapement.ts

**役割**: 脱進機（ガンギ車 + アンクル）の生成・間欠運動アニメーション。

**処理フロー**:
```
[constructor]
    ↓
[ガンギ車] → 特殊形状の歯（斜め歯）を持つ歯車
    ↓
[アンクル] → T字型のレバー + 2つの爪石
    ↓
[爪石] → 小さな直方体（ルビー色、発光）
    ↓
[配置・連結]
```

**主要な関数/メソッド**:
| 関数名 | 引数 | 戻り値 | 説明 |
|--------|------|--------|------|
| `constructor(material)` | マテリアル | Escapement | 脱進機生成 |
| `update(deltaTime)` | 経過時間 | void | 間欠回転アニメーション |
| `getEscapeWheelRotation()` | なし | number | ガンギ車回転角 |

**脱進機動作サイクル**:
```
[1] アンクル左傾き → 左爪石がガンギ歯を止める
         │
[2] てんぷ振動 → アンクル解放
         │
[3] ガンギ車が1歯分回転
         │
[4] アンクル右傾き → 右爪石がガンギ歯を止める
         │
[5] (繰り返し)
```

**実装時の注意点**:
- スプリングドライブでは実際には電磁ブレーキだが、視覚的に脱進機も表現
- アンクルの振動は三角関数で滑らかに表現

---

### 2.1.8 watch/parts/Balance.ts

**役割**: 調速機（てんぷ + ひげゼンマイ）の生成・振動アニメーション。

**処理フロー**:
```
[constructor]
    ↓
[てんぷホイール] → TorusGeometry（リング状）+ 錘
    ↓
[ひげゼンマイ] → 渦巻き状のTubeGeometry
    ↓
[軸] → 細い円柱
    ↓
[Groupにまとめる]
```

**主要な関数/メソッド**:
| 関数名 | 引数 | 戻り値 | 説明 |
|--------|------|--------|------|
| `constructor(material)` | マテリアル | Balance | 調速機生成 |
| `update(deltaTime)` | 経過時間 | void | 振動アニメーション |
| `getOscillationAngle()` | なし | number | 現在の振れ角 |

**てんぷ振動**:
```
      ←──────→
     ╱        ╲
    │    ●    │   振れ角: ±270° (typical)
     ╲        ╱   周期: 1/4秒 (4Hz = 28,800振動/時)
      ←──────→
```

**実装時の注意点**:
- 振動は `Math.sin(time * frequency) * amplitude` で表現
- ひげゼンマイはてんぷと連動して伸縮

---

### 2.1.9 watch/parts/Generator.ts

**役割**: 発電機構（ローター + コイル + 磁石）の生成・回転アニメーション。

**処理フロー**:
```
[constructor]
    ↓
[ローター（磁石）] → 半円形 + N/S極の色分け
    ↓
[コイル] → TorusGeometry（巻線表現）
    ↓
[IC基板] → 小さな四角形 + 発光
    ↓
[電磁ブレーキ表現] → コイルの発光強度変化
```

**主要な関数/メソッド**:
| 関数名 | 引数 | 戻り値 | 説明 |
|--------|------|--------|------|
| `constructor(material)` | マテリアル | Generator | 発電機構生成 |
| `update(deltaTime)` | 経過時間 | void | ローター回転・発光更新 |
| `setBrakeIntensity(value)` | 0-1 | void | ブレーキ強度設定 |

**発電機構の配置**:
```
     ┌─────────┐
     │  ローター  │  ← 高速回転
     │  N ○ S  │
     └────┬────┘
          │
     ┌────┴────┐
     │  コイル   │  ← 発光（発電表現）
     └────┬────┘
          │
     ┌────┴────┐
     │ IC基板  │  ← 緑色発光
     └─────────┘
```

**実装時の注意点**:
- ローターは秒針の約8倍速で回転（視覚的に回転を表現）
- 電磁ブレーキはコイルの発光色変化（青→オレンジ）で表現

---

### 2.1.10 watch/parts/Quartz.ts

**役割**: 水晶振動子とICの象徴的な3D表現。

**処理フロー**:
```
[constructor]
    ↓
[水晶振動子] → 小さな音叉形状 + 透明 + 発光
    ↓
[IC] → 四角い基板 + 回路パターン（テクスチャ）
    ↓
[32,768Hz表現] → 高速点滅（視覚的に振動を暗示）
```

**主要な関数/メソッド**:
| 関数名 | 引数 | 戻り値 | 説明 |
|--------|------|--------|------|
| `constructor(material)` | マテリアル | Quartz | 水晶振動子生成 |
| `update(deltaTime)` | 経過時間 | void | 発光点滅 |

**実装時の注意点**:
- 32,768Hzは表現不可能なので、視覚的に「高速振動している」雰囲気を発光で表現
- 水晶振動子は音叉形状（U字型）で作成

---

### 2.1.11 watch/parts/Hands.ts

**役割**: 時針・分針・秒針の生成・回転アニメーション（スイープ運針）。

**処理フロー**:
```
[constructor]
    ↓
[秒針] → 長く細い形状、赤いアクセント
    ↓
[分針] → 中程度の長さ、太め
    ↓
[時針] → 短く太い形状
    ↓
[各針を中心軸に配置]
```

**主要な関数/メソッド**:
| 関数名 | 引数 | 戻り値 | 説明 |
|--------|------|--------|------|
| `constructor(material)` | マテリアル | Hands | 針生成 |
| `update(timeState)` | 時刻 | void | 針角度更新 |
| `getSecondHandAngle()` | なし | number | 秒針角度（ラジアン） |

**針の回転計算**:
```
秒針: angle = -((seconds / 60) * 2π)         // 60秒で1周
分針: angle = -((minutes + seconds/60) / 60) * 2π
時針: angle = -((hours % 12 + minutes/60) / 12) * 2π
```

**スイープ運針**:
```
[一般的なクオーツ]     [スイープ運針]
    ─┼─                  ───
     │                   滑らかに連続移動
    ─┼─
  1秒ごとにジャンプ
```

**実装時の注意点**:
- スイープ運針は `seconds` を小数点以下まで計算し、滑らかに回転
- 針は文字盤より手前（Z軸+方向）に配置

---

### 2.1.12 watch/parts/Case.ts

**役割**: 文字盤・ケース・風防の生成。

**処理フロー**:
```
[constructor]
    ↓
[ケース外装] → TorusGeometry（リング状） + 金属マテリアル
    ↓
[文字盤] → CircleGeometry + インデックス（12時位置等）
    ↓
[風防（ガラス）] → 半球形 + 高透明 + 屈折
    ↓
[裏蓋] → CircleGeometry + 透明（スケルトン）
```

**主要な関数/メソッド**:
| 関数名 | 引数 | 戻り値 | 説明 |
|--------|------|--------|------|
| `constructor(material)` | マテリアル | Case | ケース生成 |
| `getMesh()` | なし | THREE.Group | メッシュ取得 |

**ケース断面図**:
```
        ╭───────────────╮  ← 風防（ドーム型ガラス）
       ╱                 ╲
      │   ─ ─ ─ ─ ─ ─   │  ← 文字盤
      │                   │
      │  ┌─────────────┐ │  ← ムーブメント空間
      │  │             │ │
      │  └─────────────┘ │
      │                   │
       ╲                 ╱
        ╰───────────────╯  ← 裏蓋（スケルトン）
```

**実装時の注意点**:
- 風防はMeshPhysicalMaterialの `transmission` で透明ガラス表現
- 文字盤のインデックスは3D形状（棒状）で立体感を出す

---

### 2.1.13 watch/materials/TransparentMaterial.ts

**役割**: 半透明・屈折・発光マテリアルの共通生成。

**マテリアル種類**:
| 名称 | 用途 | 主要パラメータ |
|------|------|----------------|
| GlassMaterial | 風防・水晶 | transmission: 0.9, roughness: 0.1 |
| MetalMaterial | 歯車・針 | metalness: 0.8, roughness: 0.3, opacity: 0.7 |
| RubyMaterial | 軸受け石 | color: 赤, emissive: 赤, opacity: 0.6 |
| CircuitMaterial | IC基板 | color: 緑, emissive: 緑 |

**主要な関数/メソッド**:
| 関数名 | 引数 | 戻り値 | 説明 |
|--------|------|--------|------|
| `createGlassMaterial()` | なし | MeshPhysicalMaterial | ガラス用 |
| `createMetalMaterial(color)` | 色 | MeshPhysicalMaterial | 金属用 |
| `createRubyMaterial()` | なし | MeshPhysicalMaterial | ルビー用 |
| `createEmissiveMaterial(color)` | 色 | MeshStandardMaterial | 発光用 |

**実装時の注意点**:
- 半透明描画には `transparent: true`, `depthWrite: false` が必要
- 描画順序問題対策として `renderOrder` を設定

---

### 2.1.14 time/TimeController.ts

**役割**: 日本時間（JST）の取得、針角度の計算。

**処理フロー**:
```
[update() 毎フレーム呼出]
    ↓
[Date.now() 取得]
    ↓
[JST変換（UTC+9）]
    ↓
[TimeState更新]
    ├── hours (0-23)
    ├── minutes (0-59)
    ├── seconds (0-59.xxx) ← 小数点以下を含む
    └── totalSeconds
```

**主要な関数/メソッド**:
| 関数名 | 引数 | 戻り値 | 説明 |
|--------|------|--------|------|
| `update()` | なし | void | 時刻更新 |
| `getTimeState()` | なし | TimeState | 現在時刻 |
| `getSecondsWithMillis()` | なし | number | ミリ秒精度の秒 |

**スイープ運針のための精密時刻**:
```
通常: seconds = 30
スイープ: seconds = 30.456  ← ミリ秒を小数点以下に
```

**実装時の注意点**:
- `performance.now()` を使用して高精度タイミングを実現
- JST変換は `new Date().toLocaleString('ja-JP', {timeZone: 'Asia/Tokyo'})`

---

### 2.1.15 controls/CameraController.ts

**役割**: カメラ操作（OrbitControls）、プリセット視点、自動回転。

**処理フロー**:
```
[constructor]
    ↓
[OrbitControls初期化]
    ├── enableDamping: true（慣性）
    ├── dampingFactor: 0.05
    ├── minDistance: 2（最小ズーム）
    └── maxDistance: 10（最大ズーム）
    ↓
[プリセット視点定義]
    ├── front: (0, 0, 5)
    ├── back: (0, 0, -5)
    ├── side: (5, 0, 0)
    └── movement: (2, 1, 3)
```

**主要な関数/メソッド**:
| 関数名 | 引数 | 戻り値 | 説明 |
|--------|------|--------|------|
| `constructor(camera, domElement)` | カメラ、DOM | CameraController | 初期化 |
| `update()` | なし | void | 毎フレーム更新 |
| `setPresetView(preset)` | 'front'/'back'/... | void | プリセット視点に移動 |
| `enableAutoRotate(enable)` | boolean | void | 自動回転切替 |

**実装時の注意点**:
- プリセット視点への移動はTween（補間）でスムーズに
- 自動回転中もユーザー操作で中断可能

---

### 2.1.16 ui/UIManager.ts

**役割**: UI全体の管理、ボタン配置、イベントハンドリング。

**UI要素**:
```
[ヘッダー]
├── タイトル「観賞用スプリング式時計」
├── ヘルプボタン [?]
└── 設定ボタン [⚙]

[フッター]
├── 視点ボタン群 [正面] [裏面] [側面] [機構]
├── 自動回転トグル [🔄]
├── 現在時刻表示 「14:32:45」
└── FPSカウンター「60 FPS」

[サイドパネル（部品クリック時）]
├── 部品名
├── 説明文
└── 閉じるボタン
```

**主要な関数/メソッド**:
| 関数名 | 引数 | 戻り値 | 説明 |
|--------|------|--------|------|
| `constructor(container)` | コンテナ | UIManager | UI初期化 |
| `showPartInfo(part)` | WatchPart | void | 部品情報表示 |
| `hidePartInfo()` | なし | void | 情報パネル非表示 |
| `updateTime(timeState)` | 時刻 | void | 時刻表示更新 |
| `updateFPS(fps)` | 数値 | void | FPS表示更新 |

**実装時の注意点**:
- 3D描画を遮らないよう、UIはポインタイベントを適切に設定
- モバイル対応のためタッチイベントも考慮

---

### 2.1.17 ui/InfoPanel.ts

**役割**: 部品クリック時の情報パネル表示。

**パネル内容**:
```
┌──────────────────────┐
│ 香箱（バレル）        │  ← 部品名
├──────────────────────┤
│ 主ゼンマイを収納する   │  ← 説明
│ 円柱形のケース。       │
│ 巻き上げられたゼンマイ │
│ がほどける力で歯車を   │
│ 回転させる。           │
├──────────────────────┤
│      [閉じる]          │
└──────────────────────┘
```

**実装時の注意点**:
- パネルはCSS Transitionでフェードイン/アウト
- 3Dシーンのクリック判定はRaycasterを使用

---

### 2.1.18 ui/DebugPanel.ts

**役割**: デバッグ情報（FPS、ワイヤーフレーム切替等）の表示。

**デバッグ機能**:
| 機能 | 操作 | 説明 |
|------|------|------|
| FPS表示 | 常時 | stats.jsによるリアルタイム表示 |
| ワイヤーフレーム | ボタン | 全メッシュをワイヤーフレーム表示 |
| 座標軸表示 | ボタン | AxesHelperの表示/非表示 |
| 描画統計 | コンソール | `renderer.info` を出力 |

**実装時の注意点**:
- 本番環境ではデバッグパネルを非表示にするフラグを用意

---

### 2.1.19 types/index.ts

**役割**: プロジェクト全体で使用する型定義。

**型定義**:
```typescript
// 部品情報
interface WatchPart {
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

// 歯車
interface Gear {
  id: string;
  teeth: number;
  connectedTo: string[];
  gearRatio: number;
  mesh: THREE.Mesh;
}

// 時刻状態
interface TimeState {
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
}

// カメラプリセット
type CameraPreset = 'front' | 'back' | 'side' | 'movement';

// 設定
interface AppConfig {
  performanceMode: boolean;
  debugMode: boolean;
  autoRotate: boolean;
}
```

---

## 2.2 ソフトウェア画面構成の概要

---

### 画面 1: メイン画面

**目的**: 3D時計の観賞・操作

**レイアウト**:
```
+------------------------------------------------------------------+
|  観賞用スプリング式時計                            [?]  [⚙]     |
+------------------------------------------------------------------+
|                                                                  |
|                                                                  |
|                                                                  |
|                     +------------------+                         |
|                     |                  |                         |
|                     |      ┌───┐       |                         |
|                     |     ╱12╲╲       |                         |
|                     |    9  ●  3      |    ← 3D時計             |
|                     |     ╲ 6 ╱       |       (WebGL Canvas)    |
|                     |      └───┘       |                         |
|                     |                  |                         |
|                     +------------------+                         |
|                                                                  |
|                                                                  |
|                                                                  |
+------------------------------------------------------------------+
| [正面] [裏面] [側面] [機構] [🔄]  │  14:32:45 JST  │   60 FPS   |
+------------------------------------------------------------------+
```

**各要素の説明**:
| 要素 | 説明 |
|------|------|
| タイトル | アプリ名「観賞用スプリング式時計」 |
| [?] | ヘルプダイアログ表示 |
| [⚙] | 設定ダイアログ表示 |
| 3D時計 | three.js描画領域（メイン） |
| [正面]等 | プリセット視点ボタン |
| [🔄] | 自動回転トグル |
| 14:32:45 JST | 現在の日本時間（デジタル） |
| 60 FPS | フレームレート表示 |

**ナビゲーション**:
```
[メイン画面]
    │
    ├── [?] → ヘルプダイアログ
    │
    ├── [⚙] → 設定ダイアログ
    │
    └── 部品クリック → 情報パネル表示
```

---

### 画面 2: 部品情報パネル（オーバーレイ）

**目的**: クリックした部品の詳細情報を表示

**レイアウト**:
```
+------------------------------------------------------------------+
|  観賞用スプリング式時計                            [?]  [⚙]     |
+------------------------------------------------------------------+
|                                        +---------------------+   |
|                                        | 香箱（バレル）      |   |
|                     +------------------+---------------------+   |
|                     |                  | 主ゼンマイを収納   |   |
|                     |      ┌───┐       | する円柱形のケー   |   |
|                     |     ╱   ╲       | ス。巻き上げられ   |   |
|                     |    │ ● │       | たゼンマイがほど   |   |
|                     |     ╲   ╱       | ける力で歯車を回   |   |
|                     |      └───┘       | 転させる。         |   |
|                     |    ↑ハイライト   +---------------------+   |
|                     +------------------+    [閉じる]         |   |
|                                        +---------------------+   |
|                                                                  |
+------------------------------------------------------------------+
| [正面] [裏面] [側面] [機構] [🔄]  │  14:32:45 JST  │   60 FPS   |
+------------------------------------------------------------------+
```

**各要素の説明**:
| 要素 | 説明 |
|------|------|
| 部品名 | クリックした部品の日本語名 |
| 説明文 | 部品の役割・機能の説明 |
| ハイライト | 選択部品が3Dで発光 |
| [閉じる] | パネルを閉じてハイライト解除 |

---

### 画面 3: 設定ダイアログ

**目的**: アプリケーション設定の変更

**レイアウト**:
```
        +-------------------------------------+
        |  設定                        [×]   |
        +-------------------------------------+
        |                                     |
        |  パフォーマンスモード  [  ON/OFF  ] |
        |  └ 低スペック環境向け簡易描画       |
        |                                     |
        |  ワイヤーフレーム表示  [  ON/OFF  ] |
        |  └ 部品の形状確認用                 |
        |                                     |
        |  座標軸表示            [  ON/OFF  ] |
        |  └ 開発・デバッグ用                 |
        |                                     |
        |  自動回転速度          [====●===]   |
        |                         遅い  速い  |
        |                                     |
        +-------------------------------------+
```

---

### 画面 4: ヘルプダイアログ

**目的**: 操作方法の説明

**レイアウト**:
```
        +-------------------------------------+
        |  ヘルプ                      [×]   |
        +-------------------------------------+
        |                                     |
        |  【カメラ操作】                     |
        |  ・左ドラッグ: 回転                 |
        |  ・右ドラッグ: 平行移動             |
        |  ・ホイール: ズーム                 |
        |                                     |
        |  【部品情報】                       |
        |  ・部品をクリックで詳細表示         |
        |                                     |
        |  【視点切替】                       |
        |  ・画面下のボタンで素早く移動       |
        |                                     |
        |              [閉じる]               |
        +-------------------------------------+
```

---

## 変更履歴

| 日付 | 版 | 変更内容 |
|------|-----|----------|
| 2026-02-07 | 1.0 | 初版作成 |
