// countdownScene.js 【B担当】
// レベル選択で難易度を決定した直後に挟むカウントダウン画面。
// 表示中にゲーム画面(GameScene)を裏側で並行起動(scene.launch)しておき、
// アセット読み込み・画面構築をカウントダウンの時間で終わらせておくことで、
// カウントダウン終了時にはGame画面へ「遷移済み」の状態にしてラグを無くす。
//
// 終了判定は「カウントダウン演出が終わった」かつ「Game画面のcreate()が終わった」の
// 両方が揃うまで待つ（読み込みがカウントダウンより長くかかっても、スタート表示のまま
// 待つだけで壊れた見た目にはならない）。

window.Game = window.Game || {};

class CountdownScene extends Phaser.Scene {
  constructor() {
    super('Countdown');
  }

  preload() {
    if (!this.textures.exists('menuBackground')) {
      this.load.image('menuBackground', Game.CONFIG.MENU_BACKGROUND_FILE);
    }
  }

  create() {
    const c = Game.CONFIG;
    this.cameras.main.setBackgroundColor('#0a0a12');
    this.add.image(c.GAME_WIDTH / 2, c.GAME_HEIGHT / 2, 'menuBackground')
      .setDisplaySize(c.GAME_WIDTH, c.GAME_HEIGHT);

    this.add.text(c.GAME_WIDTH / 2, c.GAME_HEIGHT / 2 - 120, `レベル：${Game.LEVEL_LABELS[Game.state.level]}`, Game.textStyle(20, { color: '#88ccff' }))
      .setOrigin(0.5);

    // Game画面を裏で並行起動し、この画面(Countdown)を確実に手前に表示する
    this.scene.launch('Game');
    this.scene.bringToTop();

    this.countdownDone = false;
    this.gameReady = false;

    this.scene.get('Game').events.once(Phaser.Scenes.Events.CREATE, () => {
      this.gameReady = true;
      this.tryFinish();
    });

    Game.Countdown.show(this, () => {
      this.countdownDone = true;
      this.tryFinish();
    });
  }

  // カウントダウン演出とGame画面の準備が両方終わったら、Gameへ実際にバトンタッチする
  tryFinish() {
    if (!this.countdownDone || !this.gameReady) return;
    this.scene.get('Game').events.emit('start-game');
    this.scene.stop();
  }
}
