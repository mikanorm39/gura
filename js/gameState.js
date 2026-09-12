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

  TARGET_RATIO: 0.22, // 目標ゾーンの幅（ゲージ幅に対する割合）

  MAX_SPEED: 260,              // インジケーターの最大速度(px/秒)
  DRIFT_JITTER: 90,            // ランダム変動の強さ(加速度)
  DRIFT_CHANGE_INTERVAL: 1200, // ランダム変動を更新する間隔(ms)
  PLAYER_FORCE: 900,           // プレイヤー入力による加速度
  FRICTION: 0.985,             // 毎フレームの速度減衰率
  BOUNCE_DAMPING: -0.4,        // 端で跳ね返るときの反発係数

  SCORE_PER_SECOND: 20,            // 目標ゾーン内にいる間の1秒あたりスコア
  BUILDING_PULSE_INTERVAL: 300     // ゾーン内にいる間の演出発生間隔(ms)
};

// 派生値（自動計算。直接編集しない）
Game.CONFIG.GAUGE_X = (Game.CONFIG.GAME_WIDTH - Game.CONFIG.GAUGE_WIDTH) / 2;
Game.CONFIG.TARGET_WIDTH = Game.CONFIG.GAUGE_WIDTH * Game.CONFIG.TARGET_RATIO;
Game.CONFIG.TARGET_X = Game.CONFIG.GAUGE_X + (Game.CONFIG.GAUGE_WIDTH - Game.CONFIG.TARGET_WIDTH) / 2;

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
  Game.state.score = 0;
  Game.state.timeLeft = c.TIME_LIMIT;
  Game.state.gameOver = false;
  Game.state.inZone = false;
};

Game.resetState();
