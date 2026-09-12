# バランスキープアクション（仮タイトル）

ランダムに左右へ揺れ動くインジケーターを、キー入力で目標ゾーンに留め続けてスコアを稼ぐアクションゲーム。制限時間は60秒。

## 遊び方

- ← キー：インジケーターに左向きの力を加える
- → キー：インジケーターに右向きの力を加える
- 緑ゾーン内にインジケーターを保つとスコア加算＆建物を起点に犯人オブジェクトが放物線を描いて落下
- 緑ゾーンに3秒連続で留まるとフィーバータイム発動（セイレーンが出現し、犯人が2体同時に落下）。8秒経過で自動終了
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
│   ├── effects.js      【C担当】演出（背景・建物・犯人オブジェクト・フィーバー演出）
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

`js/effects.js` が以下の画像を読み込んで使用する（描画順は奥から手前に記載）。

- `assets/空.png` — 最背面の空（画面全体）
- `assets/セイレーン.png` — 空のすぐ手前・建物より奥に配置。普段はアルファ0で完全に透明（＝空の裏に隠れている状態）。フィーバー中だけフェードで表示される
- `assets/building_1.png` / `building_2.png` / `building_3.png` — 中央の建物。スコアが `Game.CONFIG.BUILDING_SCORE_THRESHOLDS`（暫定値: 400 / 700）に到達するたびに順番に切り替わる
- `assets/海.png` — 建物にかぶさるように手前へ配置
- `assets/hannin_1.png` / `hannin_2.png` / `assets/青ガチャ.png` / `assets/黄ガチャ.png` — 常時出現候補の落下オブジェクト。ゾーン内滞在中、`Game.CONFIG.SUSPECT_DROP_INTERVAL`（暫定値: 500ms）ごとにこの中からランダムで選ばれ、建物の位置を起点に放物線を描いて落下する（フィーバー中は2体同時）
- `assets/緑ガチャ.png` / `assets/赤ガチャ.png` — フィーバー中だけ出現候補に加わる落下オブジェクト（`Game.CONFIG.FEVER_SUSPECT_IMAGE_KEYS`）

画像が無い場合はPhaserの標準の欠損テクスチャ表示になる。落下の軌道は`Game.CONFIG.SUSPECT_TRAJECTORIES`に複数パターン（通常／左右に大きく飛ぶバージョンなど）を登録でき、`weight`の比率でランダムに選ばれる。回転量は`SUSPECT_SPIN_DEGREES`、サイズは`SUSPECT_DISPLAY_WIDTH/HEIGHT`で調整できる。

## メニュー画面の背景について

`assets/背景.jpg` を `js/startScene.js` / `js/levelSelectScene.js` / `js/resultScene.js` の3画面（ゲーム画面以外の全画面）でそれぞれ読み込み、画面全体に表示する。ゲーム画面（`js/effects.js`）は独自の空・海の背景を使うため対象外。

## フォントについて

`assets/fonts/chika-Regular.ttf` を全画面共通フォントとして使用する。`index.html`で`@font-face`定義（フォント名: `Chika`）し、`Game.CONFIG.FONT_FAMILY`（`js/gameState.js`）経由で各`add.text()`の`fontFamily`に指定する。`js/main.js`でフォント読み込み完了を待ってからPhaserゲームを起動するため、初回描画で既定フォントにフォールバックすることはない。
画面内の表示テキストは漢字を使わず、ひらがな・カタカナのみで統一している。

## フィーバータイムについて

- `Game.CONFIG.FEVER_TRIGGER_DURATION`（暫定値: 3000ms）：目標ゾーンに連続でこの時間留まると発動
- `Game.CONFIG.FEVER_DURATION`（暫定値: 8000ms）：発動してからの継続時間。経過すると自動終了し、再度ゾーンに留まれば再発動できる
- 発動条件の判定・継続時間の管理は`js/ui.js`（`updateFever()`）、見た目の切り替え（セイレーンのフェード表示）は`js/effects.js`（`setFeverVisual()`）が担当
