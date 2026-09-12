// indicator.js 【A担当】
// インジケーターのランダムウォーク移動とプレイヤー入力の反映を担当。
// 参照する共有状態は Game.state / Game.CONFIG（gameState.js）。

window.Game = window.Game || {};

Game.Indicator = {
  gaugeBg: null,
  targetZone: null,
  sprite: null,

  create(scene) {
    const c = Game.CONFIG;

    this.gaugeBg = scene.add.rectangle(
      c.GAUGE_X + c.GAUGE_WIDTH / 2,
      c.GAUGE_Y,
      c.GAUGE_WIDTH,
      c.GAUGE_HEIGHT,
      0x222233
    ).setStrokeStyle(2, 0x555577);

    this.targetZone = scene.add.rectangle(
      Game.state.targetX + Game.state.targetWidth / 2,
      c.GAUGE_Y,
      Game.state.targetWidth,
      c.GAUGE_HEIGHT,
      0x33cc66,
      0.55
    ).setStrokeStyle(2, 0x55ff88);

    this.sprite = scene.add.rectangle(
      c.GAUGE_X + Game.state.indicatorPos,
      c.GAUGE_Y,
      8,
      c.GAUGE_HEIGHT + 16,
      0xffffff
    );

    scene.cursors = scene.input.keyboard.createCursorKeys();
  },

  // 目標ゾーンの幅・位置が変わった際に見た目を追従させる（ui.jsの縮小処理から呼ばれる）
  resizeTargetZone() {
    const c = Game.CONFIG;
    const s = Game.state;
    this.targetZone.setSize(s.targetWidth, c.GAUGE_HEIGHT);
    this.targetZone.x = s.targetX + s.targetWidth / 2;
  },

  update(scene, time, delta) {
    const c = Game.CONFIG;
    const s = Game.state;
    const dt = delta / 1000;

    // 一定間隔でランダムな加速度変化を加える（放置すると徐々に範囲外へ向かう）
    if (time - s.lastDriftChange > c.DRIFT_CHANGE_INTERVAL) {
      s.driftAccel = Phaser.Math.FloatBetween(-c.DRIFT_JITTER, c.DRIFT_JITTER);
      s.lastDriftChange = time;
    }

    // プレイヤー入力：左キー→左向きの力、右キー→右向きの力
    let inputAccel = 0;
    if (scene.cursors.left.isDown) inputAccel -= c.PLAYER_FORCE;
    if (scene.cursors.right.isDown) inputAccel += c.PLAYER_FORCE;

    s.indicatorVel += (s.driftAccel + inputAccel) * dt;
    s.indicatorVel *= c.FRICTION;
    s.indicatorVel = Phaser.Math.Clamp(s.indicatorVel, -c.MAX_SPEED, c.MAX_SPEED);

    s.indicatorPos += s.indicatorVel * dt;

    // 端で跳ね返る
    if (s.indicatorPos < 0) {
      s.indicatorPos = 0;
      s.indicatorVel *= c.BOUNCE_DAMPING;
    } else if (s.indicatorPos > c.GAUGE_WIDTH) {
      s.indicatorPos = c.GAUGE_WIDTH;
      s.indicatorVel *= c.BOUNCE_DAMPING;
    }

    this.sprite.x = c.GAUGE_X + s.indicatorPos;
    this.sprite.fillColor = s.inZone ? 0xffff66 : 0xffffff;
  }
};
