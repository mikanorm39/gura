// ui.js 【B担当】
// タイマー・スコア表示・目標ゾーン範囲判定を担当。
// 参照する共有状態は Game.state / Game.CONFIG（gameState.js）。
// スコア加算時は Game.Effects.pulse() を呼んで演出（C担当）に通知する。

window.Game = window.Game || {};

Game.UI = {
  scoreText: null,
  timeText: null,

  create(scene) {
    const c = Game.CONFIG;

    this.scoreText = scene.add.text(20, 20, 'Score: 0', {
      fontSize: '28px',
      color: '#ffffff'
    });

    this.timeText = scene.add.text(c.GAME_WIDTH - 160, 20, `Time: ${c.TIME_LIMIT}`, {
      fontSize: '28px',
      color: '#ffffff'
    });

    scene.add.text(
      c.GAME_WIDTH / 2,
      30,
      '← / → キーでインジケーターを緑ゾーンに保て！',
      { fontSize: '14px', color: '#aaaaaa' }
    ).setOrigin(0.5);

    scene.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => this.tickTimer(scene)
    });

    scene.time.addEvent({
      delay: c.TARGET_SHRINK_INTERVAL,
      loop: true,
      callback: () => this.shrinkZone()
    });
  },

  tickTimer(scene) {
    const s = Game.state;
    if (s.gameOver) return;
    s.timeLeft -= 1;
    this.timeText.setText(`Time: ${Math.max(s.timeLeft, 0)}`);
    if (s.timeLeft <= 0) this.endGame(scene);
  },

  // 15秒ごとに目標ゾーンを縮小する（難易度上昇）
  shrinkZone() {
    const c = Game.CONFIG;
    const s = Game.state;
    if (s.gameOver) return;

    s.targetWidth = Math.max(s.targetWidth * c.TARGET_SHRINK_RATIO, c.TARGET_MIN_WIDTH);
    s.targetX = c.GAUGE_X + (c.GAUGE_WIDTH - s.targetWidth) / 2;
    Game.Indicator.resizeTargetZone();
  },

  update(scene, time, delta) {
    const c = Game.CONFIG;
    const s = Game.state;
    if (s.gameOver) return;

    const indicatorX = c.GAUGE_X + s.indicatorPos;
    s.inZone = indicatorX >= s.targetX && indicatorX <= s.targetX + s.targetWidth;

    if (!s.inZone) return;

    if (time - s.lastScoreTick > 100) {
      s.score += Math.round(c.SCORE_PER_SECOND * 0.1);
      this.scoreText.setText(`Score: ${s.score}`);
      s.lastScoreTick = time;
    }

    if (time - s.lastPulse > c.BUILDING_PULSE_INTERVAL) {
      Game.Effects.pulse(scene);
      s.lastPulse = time;
    }
  },

  endGame(scene) {
    Game.state.gameOver = true;
    scene.scene.start('Result', { score: Game.state.score });
  }
};
