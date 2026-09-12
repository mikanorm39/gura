// gameState.js
// 全員が参照する共通の状態・定数を管理するファイル。
// ここの構造（キー名など）を変更する場合は必ずチームに相談してください。

window.Game = window.Game || {};

// ---- 共通パラメータ（レベルに関わらず固定） ----
Game.CONFIG = {
  GAME_WIDTH: 800,
  GAME_HEIGHT: 600,
  TIME_LIMIT: 60, // 秒

  GAUGE_WIDTH: 600,
  GAUGE_HEIGHT: 40,
  GAUGE_Y: 90,

  FRICTION: 0.985,             // 毎フレームの速度減衰率
  BOUNCE_DAMPING: -0.4,        // 端で跳ね返るときの反発係数

  // ---- 表示テキストの共通フォント ----
  FONT_FAMILY: "'Chika', sans-serif", // assets/fonts/chika-Regular.ttf（index.htmlで@font-face定義）

  SCORE_PER_SECOND: 20,            // 目標ゾーン内にいる間の1秒あたりスコア

  // ---- メニュー画面（Start / LevelSelect / Result）の共通背景 ----
  MENU_BACKGROUND_FILE: 'assets/背景.jpg',

  // ---- 背景（ゲーム画面） ----
  SKY_IMAGE_FILE: 'assets/空.png',   // 最背面の空
  SEA_IMAGE_FILE: 'assets/海.png',   // 建物にかぶさる海（建物より手前に表示）
  SEA_DISPLAY_HEIGHT: 220,          // 海の表示高さ(px、画面幅いっぱいに表示)
  SEA_Y: 490,                       // 海の表示位置(y座標)

  // ---- セイレーン（フィーバー演出） ----
  SIREN_IMAGE_FILE: 'assets/セイレーン.png',
  SIREN_DISPLAY_WIDTH: 1050,   // セイレーンの表示サイズ(px、画面幅800をはみ出してもよい)
  SIREN_DISPLAY_HEIGHT: 840,
  SIREN_FADE_DURATION: 400,   // 出現/消失にかけるフェード時間(ms)
  FEVER_TRIGGER_DURATION: 3000, // 目標ゾーンに連続でこの時間(ms)留まるとフィーバータイム発動
  FEVER_DURATION: 8000,         // フィーバータイムの継続時間(ms)
  FEVER_SKY_DARKNESS: 0.92,     // フィーバー中に空へ重ねる黒オーバーレイの濃さ(0〜1、大きいほど暗い)

  // ---- 描画順（値が大きいほど手前に表示される） ----
  DEPTH_SKY: -100,
  DEPTH_SKY_OVERLAY: -95, // 空を暗くする黒いオーバーレイ（空より手前・セイレーンより奥）
  DEPTH_SIREN: -90,     // 空より手前・建物より奥（アルファで表示/非表示を切り替える）
  DEPTH_BUILDING: -50,
  DEPTH_SEA: -40,       // 建物より手前
  DEPTH_SUSPECT: -30,   // 建物・海より手前

  BUILDING_Y: 350,               // 建物の表示位置(y座標、小さいほど上に表示される)
  BUILDING_DISPLAY_WIDTH: 384,  // 建物画像の表示サイズ(px)
  BUILDING_DISPLAY_HEIGHT: 480,
  BUILDING_SHAKE_AMPLITUDE: 6,   // 横揺れの振れ幅(px)
  BUILDING_SHAKE_INTERVAL: 70,   // 横揺れの更新間隔(ms、短いほど震えが細かくなる)
  BUILDING_IMAGE_KEYS: ['building1', 'building2', 'building3'], // スコアに応じて切り替わる建物画像（assets/building_1〜3.png に対応）
  BUILDING_IMAGE_FILES: ['assets/building_1.png', 'assets/building_2.png', 'assets/building_3.png'],
  BUILDING_SCORE_THRESHOLDS: [400, 700], // このスコアに到達するとそれぞれ2枚目・3枚目に切り替わる（暫定値・要調整）

  SUSPECT_DROP_INTERVAL: 500,      // ゾーン内にいる間、犯人オブジェクトを放出する間隔(ms)
  // 常に出現候補となる画像（犯人2種＋青ガチャ・黄ガチャ）
  SUSPECT_IMAGE_KEYS: ['suspect1', 'suspect2', 'gachaBlue', 'gachaYellow'],
  SUSPECT_IMAGE_FILES: ['assets/hannin_1.png', 'assets/hannin_2.png', 'assets/青ガチャ.png', 'assets/黄ガチャ.png'],
  // フィーバー中だけ出現候補に加わる画像（緑ガチャ・赤ガチャ）
  FEVER_SUSPECT_IMAGE_KEYS: ['gachaGreen', 'gachaRed'],
  FEVER_SUSPECT_IMAGE_FILES: ['assets/緑ガチャ.png', 'assets/赤ガチャ.png'],
  SUSPECT_DISPLAY_WIDTH: 70,   // 犯人オブジェクトの表示サイズ(px)
  SUSPECT_DISPLAY_HEIGHT: 70,
  SUSPECT_FALL_DISTANCE: 200,  // 建物の位置から落下先までの縦方向の距離(px、共通)
  SUSPECT_SPIN_DEGREES: 120,   // 落下中に回転する角度(度)。360で1回転、小さいほど回転は控えめ

  // 落下パターンのバリエーション。spawnSuspect()のたびにweightに応じた重み付き抽選で1つ選ばれる。
  SUSPECT_TRAJECTORIES: [
    { horizontalRange: 260, arcHeight: 100, duration: 800,  weight: 2 }, // 通常
    { horizontalRange: 500, arcHeight: 150, duration: 1100, weight: 1 }  // 左右に大きく飛ぶバージョン
  ]
};

// 派生値（自動計算。直接編集しない）
Game.CONFIG.GAUGE_X = (Game.CONFIG.GAME_WIDTH - Game.CONFIG.GAUGE_WIDTH) / 2;

// ---- レベル別パラメータ（暫定値・要調整） ----
// レベル選択画面(levelSelectScene.js)で選んだ内容がGame.applyLevel()経由でGame.CONFIGへ上書きされる。
Game.LEVELS = {
  normal: {
    TARGET_RATIO: 0.22,            // 目標ゾーンの初期幅（ゲージ幅に対する割合）
    TARGET_SHRINK_INTERVAL: 15000, // 目標ゾーンを縮小する間隔(ms)
    TARGET_SHRINK_RATIO: 0.75,     // 縮小時に幅へ掛ける倍率
    TARGET_MIN_WIDTH: 60,          // 目標ゾーンの最小幅(px)

    MAX_SPEED: 420,              // インジケーターの最大速度(px/秒)
    DRIFT_JITTER: 220,           // ランダム変動の強さ(加速度)
    DRIFT_CHANGE_INTERVAL: 700,  // ランダム変動を更新する間隔(ms)
    PLAYER_FORCE: 1300,          // プレイヤー入力による加速度

    RANDOM_SHIFT_DELAY: 30000    // 開始からこの時間経過後、一度だけ目標ゾーンの位置をランダム変更(ms)
  },
  hard: {
    TARGET_RATIO: 0.14,
    TARGET_SHRINK_INTERVAL: 10000,
    TARGET_SHRINK_RATIO: 0.7,
    TARGET_MIN_WIDTH: 40,

    MAX_SPEED: 600,
    DRIFT_JITTER: 340,
    DRIFT_CHANGE_INTERVAL: 500,
    PLAYER_FORCE: 1300,

    RANDOM_SHIFT_DELAY: 20000
  }
};

Game.LEVEL_LABELS = {
  normal: 'ノーマル',
  hard: 'ハード'
};

Game.LEVEL_DESCRIPTIONS = {
  normal: 'ひょうじゅんのなんいど',
  hard: 'ゆれがおおきく、もくひょうゾーンもせまく・はやくへんかするこうなんいど'
};

// 選んだレベルのパラメータをGame.CONFIGへ反映する
Game.applyLevel = function (levelKey) {
  const preset = Game.LEVELS[levelKey] || Game.LEVELS.normal;
  Object.assign(Game.CONFIG, preset);
  Game.state.level = levelKey;
};

// ---- 実行中に変化する状態 ----
Game.state = {};

Game.resetState = function () {
  const c = Game.CONFIG;
  Game.state.indicatorPos = c.GAUGE_WIDTH / 2; // ゲージ左端からの相対px
  Game.state.indicatorVel = 0;
  Game.state.driftAccel = 0;
  Game.state.lastDriftChange = 0;
  Game.state.lastScoreTick = 0;
  Game.state.lastSuspectDrop = 0;
  Game.state.lastShrink = 0;
  Game.state.targetWidth = c.GAUGE_WIDTH * c.TARGET_RATIO; // 目標ゾーンの幅(px、時間経過で縮小)
  Game.state.targetX = c.GAUGE_X + (c.GAUGE_WIDTH - Game.state.targetWidth) / 2;
  Game.state.score = 0;
  Game.state.timeLeft = c.TIME_LIMIT;
  Game.state.buildingStage = 0; // 現在表示中の建物画像のインデックス(0〜2)
  Game.state.gameOver = false;
  Game.state.inZone = false;
  Game.state.inZoneStreak = 0;   // 目標ゾーンに連続で留まっている時間(ms)
  Game.state.feverActive = false;
  Game.state.feverEndsAt = 0;    // フィーバー終了予定時刻(シーン内時間)
  Game.state.feverCount = 0;     // フィーバーが発動した回数
  // Game.state.level はここでリセットしない（レベル選択画面で選んだ内容をリトライ後も保持するため）
};

Game.applyLevel('normal');
Game.resetState();
