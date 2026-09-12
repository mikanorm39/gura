// startScene.js 【B担当】
// スタート画面。SPACEキーでレベル選択画面(LevelSelect)へ遷移する。

window.Game = window.Game || {};

class StartScene extends Phaser.Scene {
  constructor() {
    super('Start');
  }

  preload() {
    this.load.image('menuBackground', Game.CONFIG.MENU_BACKGROUND_FILE);
  }

  create() {
    const c = Game.CONFIG;
    this.cameras.main.setBackgroundColor('#0a0a12');
    this.add.image(c.GAME_WIDTH / 2, c.GAME_HEIGHT / 2, 'menuBackground')
      .setDisplaySize(c.GAME_WIDTH, c.GAME_HEIGHT);

    this.add.text(c.GAME_WIDTH / 2, c.GAME_HEIGHT / 2 - 60, 'わるいてんいんをしばけ！！', Game.textStyle(36, { color: '#ffffff' }))
      .setOrigin(0.5);

    this.add.text(c.GAME_WIDTH / 2, c.GAME_HEIGHT / 2, '← / → キーでインジケーターをみどりゾーンにたもて！', Game.textStyle(16, { color: '#aaaaaa' }))
      .setOrigin(0.5);

    const prompt = this.add.text(c.GAME_WIDTH / 2, c.GAME_HEIGHT / 2 + 60, 'スペースキーでスタート', Game.textStyle(22, { color: '#ffff66' }))
      .setOrigin(0.5);

    this.tweens.add({
      targets: prompt,
      alpha: { from: 1, to: 0.3 },
      duration: 700,
      yoyo: true,
      repeat: -1
    });

    this.input.keyboard.once('keydown-SPACE', () => {
      this.scene.start('LevelSelect');
    });
  }
}
