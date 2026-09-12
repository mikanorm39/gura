// countdown.js 【B担当】
// 「3」→「2」→「1」→「スタート！」を1秒ごとに表示する演出本体。
// countdownScene.js から呼び出される（渡された scene 上にテキストを描画するだけなので、
// どのシーンから呼んでも動く）。

window.Game = window.Game || {};

Game.Countdown = {
  // scene: 呼び出し元のGameScene。onComplete: カウントダウン終了後に呼ばれるコールバック
  show(scene, onComplete) {
    const c = Game.CONFIG;

    // ゲーム画面の要素より確実に手前に表示する
    const overlay = scene.add.rectangle(c.GAME_WIDTH / 2, c.GAME_HEIGHT / 2, c.GAME_WIDTH, c.GAME_HEIGHT, 0x000000, 0.5)
      .setDepth(1000);
    const countText = scene.add.text(c.GAME_WIDTH / 2, c.GAME_HEIGHT / 2, '', Game.textStyle(72, { color: '#ffff66' }))
      .setOrigin(0.5)
      .setDepth(1001);

    const steps = ['3', '2', '1', 'スタート！'];
    let stepIndex = 0;

    const showStep = () => {
      countText.setText(steps[stepIndex]);
      countText.setScale(0.4);
      scene.tweens.add({
        targets: countText,
        scale: 1,
        duration: 250,
        ease: 'Back.easeOut'
      });

      scene.time.delayedCall(1000, () => {
        stepIndex += 1;
        if (stepIndex < steps.length) {
          showStep();
        } else {
          overlay.destroy();
          countText.destroy();
          onComplete();
        }
      });
    };

    showStep();
  }
};
