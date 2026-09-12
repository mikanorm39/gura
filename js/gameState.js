// gameState.js
// 全員が参照する共通の状態・定数を管理するファイル。
// ここの構造（キー名など）を変更する場合は必ずチームに相談してください。

window.Game = window.Game || {};

// ---- 調整可能パラメータ（暫定値。バランス調整はここを触ればOK） ----
Game.CONFIG = {
  GAME_WIDTH: 800,
  GAME_HEIGHT: 600,
  TIME_LIMIT: 60, // 秒

  GAUGE_WIDTH: 600,
  GAUGE_HEIGHT: 40,
  GAUGE_Y: 90,

  TARGET_RATIO: 0.22, // 目標ゾーンの初期幅（ゲージ幅に対する割合）
  TARGET_SHRINK_INTERVAL: 15000, // 目標ゾーンを縮小する間隔(ms)
  TARGET_SHRINK_RATIO: 0.75,     // 縮小時に幅へ掛ける倍率
  TARGET_MIN_WIDTH: 60,          // 目標ゾーンの最小幅(px)

  MAX_SPEED: 420,              // インジケーターの最大速度(px/秒)
  DRIFT_JITTER: 220,           // ランダム変動の強さ(加速度)
  DRIFT_CHANGE_INTERVAL: 700,  // ランダム変動を更新する間隔(ms)
  PLAYER_FORCE: 1300,          // プレイヤー入力による加速度
  FRICTION: 0.985,             // 毎フレームの速度減衰率
  BOUNCE_DAMPING: -0.4,        // 端で跳ね返るときの反発係数

  SCORE_PER_SECOND: 20,            // 目標ゾーン内にいる間の1秒あたりスコア
  BUILDING_PULSE_INTERVAL: 300,    // ゾーン内にいる間の演出発生間隔(ms)

  RANDOM_SHIFT_DELAY: 30000        // 開始からこの時間経過後、一度だけ目標ゾーンの位置をランダム変更(ms)
};

// 派生値（自動計算。直接編集しない）
Game.CONFIG.GAUGE_X = (Game.CONFIG.GAME_WIDTH - Game.CONFIG.GAUGE_WIDTH) / 2;

// ---- 実行中に変化する状態 ----
Game.state = {};

Game.resetState = function () {
  const c = Game.CONFIG;
  Game.state.indicatorPos = c.GAUGE_WIDTH / 2; // ゲージ左端からの相対px
  Game.state.indicatorVel = 0;
  Game.state.driftAccel = 0;
  Game.state.lastDriftChange = 0;
  Game.state.lastScoreTick = 0;
  Game.state.lastPulse = 0;
  Game.state.lastShrink = 0;
  Game.state.targetWidth = c.GAUGE_WIDTH * c.TARGET_RATIO; // 目標ゾーンの幅(px、時間経過で縮小)
  Game.state.targetX = c.GAUGE_X + (c.GAUGE_WIDTH - Game.state.targetWidth) / 2;
  Game.state.score = 0;
  Game.state.timeLeft = c.TIME_LIMIT;
  Game.state.gameOver = false;
  Game.state.inZone = false;
};

Game.resetState();
