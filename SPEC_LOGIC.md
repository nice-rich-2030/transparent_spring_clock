# 観賞用スプリング式時計 3Dビューア ロジック・アルゴリズム詳細設計書 (SPEC_LOGIC.md)

---

## 3.1 スイープ運針アルゴリズム

### 背景
スプリングドライブの最大の特徴は、秒針が滑らかに連続回転する「スイープ運針」である。一般的なクオーツ時計の1秒ごとのステップ運針ではなく、機械式時計特有の流れるような動きを再現する必要がある。

### 提案するアルゴリズム

**高精度時刻取得**:
```
入力: なし
出力: seconds（0.000 ～ 59.999 の浮動小数点）

1. now = performance.now()  // ミリ秒精度のタイムスタンプ
2. date = new Date()
3. baseSeconds = date.getSeconds()
4. millis = date.getMilliseconds()
5. seconds = baseSeconds + (millis / 1000)
6. return seconds
```

**秒針角度計算**:
```
入力: seconds（浮動小数点）
出力: angle（ラジアン）

1. fraction = seconds / 60  // 0.0 ～ 0.9999...
2. angle = -fraction * 2 * π  // 時計回りなので負
3. return angle
```

**フレーム補間（オプション）**:
```
入力: prevAngle, targetAngle, deltaTime
出力: smoothAngle

// 急激な変化を防ぐ線形補間
1. t = min(deltaTime * 60, 1.0)  // 補間係数
2. smoothAngle = lerp(prevAngle, targetAngle, t)
3. return smoothAngle
```

### 時刻取得フロー図
```
[performance.now()]          [Date()]
       │                        │
       ▼                        ▼
 高精度タイミング        年月日時分秒ミリ秒
       │                        │
       └────────┬───────────────┘
                ▼
    [seconds = sec + ms/1000]
                │
                ▼
    [angle = -(seconds/60) × 2π]
                │
                ▼
        [秒針メッシュ.rotation.z = angle]
```

### 特徴（洗練されたポイント）
1. **ミリ秒精度**: `performance.now()` と `Date.getMilliseconds()` の組み合わせで高精度
2. **フレームレート非依存**: 実時刻ベースなのでFPS変動の影響を受けない
3. **補間オプション**: 極端なフレームドロップ時も滑らかさを維持

### パフォーマンス目標
- 計算時間: 1ms未満/フレーム
- 60FPSで秒針が肉眼で滑らかに見えること（ステップが視認できない）

---

## 3.2 歯車連動回転アルゴリズム

### 背景
機械式時計の輪列では、複数の歯車が噛み合い、ギア比に基づいて回転速度が変化する。視覚的にリアルな歯車の動きを再現するには、正確なギア比計算と位相調整が必要。

### 歯車構成データ
| ID | 名称 | 歯数 | 連結先 | ギア比（対香箱車） |
|----|------|------|--------|-------------------|
| G1 | 香箱車 | 80 | G2 | 1.0 |
| G2 | 二番車 | 64 | G1, G3 | 80/64 = 1.25 |
| G3 | 三番車 | 75 | G2, G4 | 1.25 × 64/75 = 1.067 |
| G4 | 四番車 | 80 | G3, G5 | 1.067 × 75/80 = 1.0 |
| G5 | ガンギ車連結 | 20 | G4 | 1.0 × 80/20 = 4.0 |

### 提案するアルゴリズム

**歯車回転角度計算**:
```
入力: baseRotation（香箱車の回転角）, gears[]（歯車配列）
出力: 各歯車の回転角

FOR each gear in gears:
    1. cumulativeRatio = 1.0
    2. FOR each ancestor in gear.ancestors:
        ratio = ancestor.teeth / gear.connectedTo.teeth
        cumulativeRatio *= ratio
    3. gear.rotation = baseRotation * cumulativeRatio

    // 噛み合う歯車は逆回転
    4. IF gear.index % 2 == 1:
        gear.rotation *= -1

    // 歯が噛み合う位相調整
    5. gear.rotation += gear.phaseOffset
```

**香箱車の回転（時間ベース）**:
```
入力: totalSeconds（00:00:00からの経過秒）
出力: 香箱車の回転角

// 香箱車は12時間で1回転（目安）
1. hoursElapsed = totalSeconds / 3600
2. barrelRotation = (hoursElapsed / 12) * 2 * π
3. return barrelRotation
```

### 歯車連動図
```
[香箱車 G1]
    │ 80歯
    ▼
[二番車 G2] ───────→ 分針（1時間で1回転）
    │ 64歯
    ▼
[三番車 G3]
    │ 75歯
    ▼
[四番車 G4] ───────→ 秒針（1分で1回転）
    │ 80歯
    ▼
[ガンギ車連結 G5]
    │ 20歯
    ▼
[脱進機へ]
```

### 特徴（洗練されたポイント）
1. **位相オフセット**: 歯車の歯が正確に噛み合うよう、初期位相を調整
2. **交互逆回転**: 噛み合う歯車は必ず逆方向に回転
3. **リアルなギア比**: 実際の時計に近い歯数設計

### パフォーマンス目標
- 5枚の歯車の回転計算: 0.5ms未満/フレーム
- 歯車間の噛み合いズレが視認できないこと

---

## 3.3 半透明オブジェクト描画順序アルゴリズム

### 背景
three.jsでは半透明オブジェクトの描画順序がカメラからの距離で決まるが、複雑に重なり合う時計部品では正しく描画されない「Z-Fighting」問題が発生する。

### 問題例
```
[カメラから見た場合]

不正確な描画:          正確な描画:
┌─────────┐            ┌─────────┐
│ 歯車A   │            │ 歯車A   │
│   ┌─────│            │   ┌─────┤
│   │歯車B│            │   │歯車B│← 奥が透けて見える
└───┴─────┘            └───┴─────┘
  ↑ 奥が見えない
```

### 提案するアルゴリズム

**手動描画順序（renderOrder）**:
```
入力: parts[]（全部品リスト）
出力: 各部品の renderOrder 値

// Z座標（奥行き）に基づいて描画順序を設定
1. sortedParts = parts.sort((a, b) => a.position.z - b.position.z)

2. FOR i = 0 to sortedParts.length:
    sortedParts[i].mesh.renderOrder = i

// 透明度が高いものは後に描画
3. FOR each part in parts:
    IF part.transparency > 0.7:
        part.mesh.renderOrder += 100
```

**動的更新（カメラ移動時）**:
```
入力: camera, parts[]
出力: 更新された renderOrder

1. cameraPosition = camera.position

2. FOR each part in parts:
    distance = part.mesh.position.distanceTo(cameraPosition)
    part.mesh.renderOrder = floor(distance * 10)

// 逆順（遠くから描画）
3. FOR each part in parts:
    part.mesh.renderOrder = maxOrder - part.mesh.renderOrder
```

**マテリアル設定**:
```
半透明マテリアルの設定:
{
    transparent: true,
    opacity: 0.3 ～ 0.7,
    depthWrite: false,      // 深度バッファ書き込み無効
    depthTest: true,        // 深度テストは有効
    side: THREE.DoubleSide  // 両面描画
}
```

### 描画順序決定フロー
```
[カメラ位置取得]
       │
       ▼
[各部品とカメラの距離計算]
       │
       ▼
[距離でソート（遠い順）]
       │
       ▼
[renderOrder 割り当て]
       │
       ▼
[レンダリング実行]
       │
       ▼
[遠くの部品から順に描画]
```

### 特徴（洗練されたポイント）
1. **動的ソート**: カメラ移動に応じてリアルタイムに描画順序更新
2. **depthWrite無効化**: 半透明同士の干渉を防止
3. **レイヤー分離**: 高透明部品（風防）は最後に描画

### パフォーマンス目標
- ソート処理: 1ms未満/フレーム（100部品想定）
- 描画順序の破綻が視認できないこと

---

## 3.4 脱進機アニメーションアルゴリズム

### 背景
脱進機（エスケープメント）は、ガンギ車とアンクルが交互に動作し、エネルギーを一定速度で解放する。スプリングドライブでは電磁ブレーキが主役だが、視覚的に脱進機の動きも表現する。

### 提案するアルゴリズム

**アンクル振動（てんぷ連動）**:
```
入力: time（経過時間）, frequency（振動周波数 = 4Hz）
出力: ankleAngle（アンクルの傾き角）

1. oscillation = sin(time * frequency * 2 * π)
2. ankleAngle = oscillation * 振れ幅（例: 8度）
3. return ankleAngle
```

**ガンギ車間欠回転**:
```
入力: ankleAngle, escapementWheelTeeth（歯数 = 20）
出力: wheelRotation

// アンクルが左右に振れるたびに1歯分進む
1. IF ankleAngle が正から負に変化 OR 負から正に変化:
    wheelRotation += (1 / escapementWheelTeeth) * 2 * π

2. return wheelRotation
```

**アニメーションサイクル図**:
```
時間: 0.0s    0.125s    0.25s    0.375s    0.5s
      │        │         │        │         │
アンクル: ←──────→──────←──────→──────←
            ↑         ↑         ↑
ガンギ車:   1歯進む   1歯進む   1歯進む
```

### 特徴（洗練されたポイント）
1. **正弦波振動**: 自然な往復運動を表現
2. **歯送り同期**: アンクルの反転タイミングでガンギ車が進む
3. **爪石発光**: 接触時に爪石が一瞬発光してインパルスを表現

### パフォーマンス目標
- 振動計算: 0.1ms未満/フレーム
- 4Hz振動が滑らかに見えること（60FPSで15フレーム/サイクル）

---

## 3.5 発電機構・電磁ブレーキ表現アルゴリズム

### 背景
スプリングドライブの核心は、ローターの回転で発電し、ICが電磁ブレーキで回転速度を精密制御すること。この目に見えない電気的制御を視覚的に表現する。

### 提案するアルゴリズム

**ローター回転速度**:
```
入力: secondsRotation（秒針の回転角速度）
出力: rotorRotation

// ローターは秒針の約8倍速で回転（視覚的インパクト）
1. rotorSpeed = 8
2. rotorRotation = secondsRotation * rotorSpeed
3. return rotorRotation
```

**電磁ブレーキ発光表現**:
```
入力: time
出力: coilEmissiveIntensity, coilColor

// ブレーキ強度は周期的に変化（実際のIC制御を模倣）
1. brakeStrength = (sin(time * 10) + 1) / 2  // 0.0 ～ 1.0

// 発光色: 弱(青) → 強(オレンジ)
2. IF brakeStrength < 0.5:
    coilColor = lerp(BLUE, WHITE, brakeStrength * 2)
ELSE:
    coilColor = lerp(WHITE, ORANGE, (brakeStrength - 0.5) * 2)

3. coilEmissiveIntensity = brakeStrength * 2.0
4. return { coilEmissiveIntensity, coilColor }
```

**発電量インジケーター**:
```
入力: rotorSpeed
出力: powerLevel

1. powerLevel = min(rotorSpeed / maxSpeed, 1.0)
2. icEmissive = GREEN * powerLevel
3. return powerLevel
```

### 視覚表現図
```
[ローター回転状態]
    高速回転          低速回転
       ○                ○
      ╱│╲              ╱│╲
       │               │
    強い発電         弱い発電

[コイル発光]
    青(弱)  →  白(中)  →  オレンジ(強)
    ○         ◎          ●
```

### 特徴（洗練されたポイント）
1. **色のグラデーション**: ブレーキ強度を青→オレンジで直感的に表現
2. **脈動発光**: 実際のPWM制御を模した周期的変化
3. **IC連動**: 発電量に応じてIC基板も発光

### パフォーマンス目標
- 発光計算: 0.2ms未満/フレーム
- 色変化がスムーズに見えること

---

## 3.6 カメラプリセット補間アルゴリズム

### 背景
ユーザーがプリセット視点（正面・裏面・側面・機構）をクリックしたとき、瞬間移動ではなくスムーズにカメラが移動する必要がある。

### 提案するアルゴリズム

**イージング関数（easeInOutCubic）**:
```
入力: t（0.0 ～ 1.0 の進行度）
出力: easedT

1. IF t < 0.5:
    easedT = 4 * t * t * t
2. ELSE:
    easedT = 1 - pow(-2 * t + 2, 3) / 2
3. return easedT
```

**カメラ位置・注視点補間**:
```
入力: startPos, endPos, startTarget, endTarget, duration, elapsedTime
出力: currentPos, currentTarget

1. progress = elapsedTime / duration
2. t = easeInOutCubic(progress)

// 位置の線形補間（球面補間も可）
3. currentPos = lerp(startPos, endPos, t)

// 注視点の線形補間
4. currentTarget = lerp(startTarget, endTarget, t)

5. camera.position.copy(currentPos)
6. controls.target.copy(currentTarget)
```

**プリセット定義**:
```
presets = {
    front:    { pos: (0, 0, 5),   target: (0, 0, 0) },
    back:     { pos: (0, 0, -5),  target: (0, 0, 0) },
    side:     { pos: (5, 0, 0),   target: (0, 0, 0) },
    movement: { pos: (2, 1, 3),   target: (0, -0.5, 0) }  // ムーブメント寄り
}
```

### カメラ移動フロー
```
[プリセットボタンクリック]
         │
         ▼
[現在位置 → 目標位置を設定]
         │
         ▼
[アニメーション開始（duration = 1.0秒）]
         │
         ▼
[毎フレーム]
    ├── elapsedTime 更新
    ├── progress 計算
    ├── イージング適用
    └── カメラ位置・注視点更新
         │
         ▼
[progress >= 1.0 でアニメーション終了]
```

### 特徴（洗練されたポイント）
1. **イージング**: 開始・終了時に減速し、自然な動き
2. **中断可能**: アニメーション中にユーザー操作で中断
3. **球面補間オプション**: 大きな角度変化時に経路が自然

### パフォーマンス目標
- 補間計算: 0.1ms未満/フレーム
- 1秒で視点移動完了

---

## 3.7 部品クリック判定（レイキャスト）アルゴリズム

### 背景
ユーザーが3D空間上の部品をクリックしたとき、正確にどの部品がクリックされたかを判定する必要がある。半透明部品が重なっているため、最前面だけでなく複数の交差判定が必要。

### 提案するアルゴリズム

**レイキャスト実行**:
```
入力: mouseEvent, camera, parts[]
出力: clickedPart または null

1. // マウス座標を正規化デバイス座標（NDC）に変換
   mouse.x = (event.clientX / window.innerWidth) * 2 - 1
   mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

2. // レイ生成
   raycaster.setFromCamera(mouse, camera)

3. // 全部品との交差判定
   intersects = raycaster.intersectObjects(parts.map(p => p.mesh), true)

4. // 最初の交差オブジェクトを取得
   IF intersects.length > 0:
       hitMesh = intersects[0].object
       clickedPart = findPartByMesh(hitMesh)
       return clickedPart
   ELSE:
       return null
```

**部品ハイライト**:
```
入力: part
出力: なし（部品のマテリアル変更）

1. // 現在のハイライトを解除
   IF currentHighlightedPart:
       currentHighlightedPart.mesh.material.emissive.set(0x000000)

2. // 新しい部品をハイライト
   part.mesh.material.emissive.set(0x333333)
   part.mesh.material.emissiveIntensity = 1.0

3. currentHighlightedPart = part
```

### レイキャスト図
```
[カメラ] ─────────●─────────────→ [無限遠]
                 │
           ┌─────┼─────┐
           │     │     │
           │  ●──┼──●  │  ← 部品A（交差）
           │     │     │
           └─────┼─────┘
                 │
           ┌─────┼─────┐
           │     │     │
           │     ●     │  ← 部品B（交差）
           │           │
           └───────────┘
```

### 特徴（洗練されたポイント）
1. **再帰的交差判定**: `recursive: true` で子メッシュも判定
2. **最前面優先**: `intersects[0]` が最も近い交差点
3. **即時フィードバック**: クリックで即座にハイライト

### パフォーマンス目標
- レイキャスト判定: 2ms未満/クリック
- クリック後50ms以内にハイライト表示

---

## 洗練度チェックリスト

| 項目 | 対応状況 | 備考 |
|------|----------|------|
| ✅ 競合制御 | 対応 | アニメーションループは単一スレッドで競合なし |
| ✅ 例外処理 | 対応 | WebGL非対応、リソース読込失敗時の処理設計済み |
| ✅ パフォーマンス目標 | 明記 | 各ロジックにms単位で目標設定 |
| ✅ スケーラビリティ | 対応 | 部品数増加時もO(n)計算量を維持 |
| ✅ 監査対応ログ | 対応 | 初期化完了、エラー発生をconsole出力 |
| ✅ フレームレート独立 | 対応 | 実時刻ベースでFPS変動に依存しない |
| ✅ ユーザー中断対応 | 対応 | カメラ補間中のユーザー操作で中断可能 |

---

## 変更履歴

| 日付 | 版 | 変更内容 |
|------|-----|----------|
| 2026-02-07 | 1.0 | 初版作成 |
