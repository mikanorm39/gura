// ui.js 【B担当】
// タイマー・スコア表示・目標ゾーン範囲判定を担当。
// 参照する共有状態は Game.state / Game.CONFIG（gameState.js）。
// スコア加算時は Game.Effects.pulse() を呼んで演出（C担当）に通知する。

window.Game = window.Game || {};

Game.UI = {
  scoreText: null,
  timeText: null,
  gameOverGroup: null,
  finalScoreText: null,

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

    // ゲームオーバー表示（普段は非表示）
    this.gameOverGroup = scene.add.container(c.GAME_WIDTH / 2, c.GAME_HEIGHT / 2);
    const overlay = scene.add.rectangle(0, 0, 400, 200, 0x000000, 0.8);
    const overText = scene.add.text(0, -40, 'GAME OVER', {
      fontSize: '36px', color: '#ffffff'
    }).setOrigin(0.5);
    this.finalScoreText = scene.add.text(0, 10, '', {
      fontSize: '22px', color: '#ffffff'
    }).setOrigin(0.5);
    const restartText = scene.add.text(0, 55, 'SPACEキーでリスタート', {
      fontSize: '16px', color: '#aaaaaa'
    }).setOrigin(0.5);
    this.gameOverGroup.add([overlay, overText, this.finalScoreText, restartText]);
    this.gameOverGroup.setVisible(false);

    scene.input.keyboard.on('keydown-SPACE', () => {
      if (Game.state.gameOver) scene.scene.restart();
    });
  },

  tickTimer(scene) {
    const s = Game.state;
    if (s.gameOver) return;
    s.timeLeft -= 1;
    this.timeText.setText(`Time: ${Math.max(s.timeLeft, 0)}`);
    if (s.timeLeft <= 0) this.endGame(scene);
  },

  update(scene, time, delta) {
    const c = Game.CONFIG;
    const s = Game.state;
    if (s.gameOver) return;

    const indicatorX = c.GAUGE_X + s.indicatorPos;
    s.inZone = indicatorX >= c.TARGET_X && indicatorX <= c.TARGET_X + c.TARGET_WIDTH;

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
    this.finalScoreText.setText(`Score: ${Game.state.score}`);
    this.gameOverGroup.setVisible(true);
  }
};
