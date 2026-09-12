// startScene.js 【B担当】
// スタート画面。SPACEキーでゲーム画面(Game)へ遷移する。

window.Game = window.Game || {};

class StartScene extends Phaser.Scene {
  constructor() {
    super('Start');
  }

  create() {
    const c = Game.CONFIG;
    this.cameras.main.setBackgroundColor('#0a0a12');

    this.add.text(c.GAME_WIDTH / 2, c.GAME_HEIGHT / 2 - 60, 'バランスキープアクション', {
      fontSize: '36px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(c.GAME_WIDTH / 2, c.GAME_HEIGHT / 2, '← / → キーでインジケーターを緑ゾーンに保て！', {
      fontSize: '16px',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    const prompt = this.add.text(c.GAME_WIDTH / 2, c.GAME_HEIGHT / 2 + 60, 'SPACEキーでスタート', {
      fontSize: '22px',
      color: '#ffff66'
    }).setOrigin(0.5);

    this.tweens.add({
      targets: prompt,
      alpha: { from: 1, to: 0.3 },
      duration: 700,
      yoyo: true,
      repeat: -1
    });

    this.input.keyboard.once('keydown-SPACE', () => {
      this.scene.start('Game');
    });
  }
}
