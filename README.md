# バランスキープアクション（仮タイトル）

ランダムに左右へ揺れ動くインジケーターを、キー入力で目標ゾーンに留め続けてスコアを稼ぐアクションゲーム。制限時間は60秒。

## 遊び方

- ← キー：インジケーターに左向きの力を加える
- → キー：インジケーターに右向きの力を加える
- 緑ゾーン内にインジケーターを保つとスコア加算＆中央オブジェクトが反応
- 画面の流れ：スタート画面（SPACEでスタート）→ レベル選択画面（↑↓で選択、SPACEで決定）→ ゲーム画面（60秒）→ リザルト画面（SPACEでもう一度／ESCでスタート画面へ）
- リザルトでSPACEを押すと直前に選んだレベルのままリトライする。レベルを変えたい場合はESCでスタート画面へ戻り、選び直す

## 動かし方

1. VSCodeで本フォルダを開く
2. 拡張機能「Live Server」をインストール
3. `index.html` を右クリック →「Open with Live Server」

ビルド環境は無し。ブラウザで `index.html` をLive Server経由で開くだけで動作します。

## ファイル構成

```
/
├── index.html          Phaser CDN読み込み＋js/以下の読み込みのみ（基本触らない）
├── js/
│   ├── gameState.js    全員が参照する共通の状態・定数（構造変更は要相談）
│   ├── indicator.js    【A担当】インジケーターの動き（ランダムウォーク＋入力）
│   ├── ui.js           【B担当】タイマー・スコア・範囲判定
│   ├── effects.js      【C担当】演出（中央オブジェクト＝建物）
│   ├── startScene.js       【B担当】スタート画面
│   ├── levelSelectScene.js 【B担当】レベル選択画面（ノーマル/ハード）
│   ├── resultScene.js      【B担当】リザルト画面
│   └── main.js         各モジュール・各画面を繋ぐ司令塔（基本触らない）
├── assets/             動画・画像素材（C担当が使用）
└── README.md
```

各ファイルは `window.Game` というグローバルな名前空間を共有します（ビルド無しのため import/export は使わず、`Game.XXX` にぶら下げる方式）。`index.html` でのスクリプト読み込み順（gameState → indicator → ui → effects → startScene → levelSelectScene → resultScene → main）を変えないでください。

## 共有状態（gameState.js）

- `Game.CONFIG`：速度・加速度・目標ゾーン幅・スコア倍率などの調整用パラメータ。レベル別の値は`Game.LEVELS`から上書きされる。
- `Game.state`：フレームごとに変化する実行時の値（インジケーター位置、スコア、残り時間、選択中レベルなど）。
- `Game.LEVELS`：レベル別パラメータのプリセット（`normal` / `hard`）。バランス調整はここを編集する。
- `Game.applyLevel(levelKey)`：指定したレベルのパラメータを`Game.CONFIG`へ反映し、`Game.state.level`を更新する。

## 現在暫定値（要調整）

- ノーマル：目標ゾーン幅22%、最大速度420、ランダム変動強度220
- ハード：目標ゾーン幅14%、最大速度600、ランダム変動強度340（詳細は`Game.LEVELS`参照）
- スコア：ゾーン内滞在で1秒あたり20点（共通）

## 演出について

中央の建物は `js/effects.js` が以下の画像を読み込んで表示する。

- `assets/building_1.png`
- `assets/building_2.png`
- `assets/building_3.png`

スコアが `Game.CONFIG.BUILDING_SCORE_THRESHOLDS`（暫定値: 400 / 700）に到達するたびに、この3枚を順番に切り替える。画像が無い場合はPhaserの標準の欠損テクスチャ表示になる。
