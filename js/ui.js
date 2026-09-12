// ui.js 【B担当】
// タイマー・スコア表示・目標ゾーン範囲判定・フィーバータイム管理を担当。
// 参照する共有状態は Game.state / Game.CONFIG（gameState.js）。
// スコア加算時は Game.Effects.spawnSuspect() を呼んで演出（C担当）に通知する。
// 目標ゾーンに連続でFEVER_TRIGGER_DURATION留まるとフィーバー開始、
// Game.Effects.setFeverVisual() でセイレーンの表示切り替えを依頼する。

window.Game = window.Game || {};

Game.UI = {
  scoreText: null,
  timeText: null,

  create(scene) {
    const c = Game.CONFIG;

    this.scoreText = scene.add.text(20, 20, 'スコア：0', Game.textStyle(28, { color: '#ffffff' }));

    this.timeText = scene.add.text(c.GAME_WIDTH - 20, 20, `タイム：${c.TIME_LIMIT}`, Game.textStyle(28, { color: '#ffffff' }))
      .setOrigin(1, 0);

    scene.add.text(20, 70, `レベル：${Game.LEVEL_LABELS[Game.state.level]}`, Game.textStyle(14, { color: '#88ccff' }));

    scene.add.text(c.GAME_WIDTH - 20, 70, 'エスケープ：タイトルへ', Game.textStyle(14, { color: '#88ccff' }))
      .setOrigin(1, 0);

    scene.add.text(
      c.GAME_WIDTH / 2,
      110,
      '← / → キーでインジケーターをみどりゾーンにたもて！',
      Game.textStyle(14, { color: '#aaaaaa' })
    ).setOrigin(0.5);

    this.feverText = scene.add.text(c.GAME_WIDTH / 2, 150, 'フィーバータイム！', Game.textStyle(20, { color: '#ff66aa' }))
      .setOrigin(0.5).setVisible(false);
  },

  // カウントダウン演出が終わってから呼ばれる：制限時間・ゾーン変化タイマーを開始する
  // （create()の時点で動かしてしまうとカウントダウン中に時間やゾーンが進んでしまうため分離している）
  startTimers(scene) {
    const c = Game.CONFIG;

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

    // 開始から一定時間後、ゲーム中に一度だけ目標ゾーンの位置をランダムに変更する
    scene.time.delayedCall(c.RANDOM_SHIFT_DELAY, () => this.randomShiftZone(scene));
  },

  tickTimer(scene) {
    const s = Game.state;
    if (s.gameOver) return;
    s.timeLeft -= 1;
    this.timeText.setText(`タイム：${Math.max(s.timeLeft, 0)}`);
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

  // 開始から30秒後などに一度だけ発生する、目標ゾーン位置のランダム変更
  randomShiftZone(scene) {
    const c = Game.CONFIG;
    const s = Game.state;
    if (s.gameOver) return;

    s.targetX = Phaser.Math.FloatBetween(0, c.GAUGE_WIDTH - s.targetWidth);
    Game.Indicator.resizeTargetZone();
    Game.Indicator.flashTargetZone(scene);
  },

  update(scene, time, delta) {
    const c = Game.CONFIG;
    const s = Game.state;
    if (s.gameOver) return;

    const indicatorX = c.GAUGE_X + s.indicatorPos;
    s.inZone = indicatorX >= s.targetX && indicatorX <= s.targetX + s.targetWidth;

    this.updateFever(scene, time, delta);

    if (!s.inZone) return;

    if (time - s.lastScoreTick > 100) {
      s.score += Math.round(c.SCORE_PER_SECOND * 0.1);
      this.scoreText.setText(`スコア：${s.score}`);
      s.lastScoreTick = time;
    }

    if (time - s.lastSuspectDrop > c.SUSPECT_DROP_INTERVAL) {
      Game.Effects.spawnSuspect(scene);
      s.lastSuspectDrop = time;
    }
  },

  // 目標ゾーンへの連続滞在時間を追跡し、一定時間でフィーバータイムを開始/終了する
  updateFever(scene, time, delta) {
    const c = Game.CONFIG;
    const s = Game.state;

    s.inZoneStreak = s.inZone ? s.inZoneStreak + delta : 0;

    if (!s.feverActive && s.inZoneStreak >= c.FEVER_TRIGGER_DURATION) {
      s.feverActive = true;
      s.feverEndsAt = time + c.FEVER_DURATION;
      s.feverCount += 1;
      this.feverText.setVisible(true);
      Game.Effects.setFeverVisual(scene, true);
      scene.setFeverBgm(true);
    } else if (s.feverActive && time >= s.feverEndsAt) {
      s.feverActive = false;
      s.inZoneStreak = 0;
      this.feverText.setVisible(false);
      Game.Effects.setFeverVisual(scene, false);
      scene.setFeverBgm(false);
    }
  },

  endGame(scene) {
    Game.state.gameOver = true;
    scene.scene.start('Result', { score: Game.state.score, feverCount: Game.state.feverCount });
  }
};
