// resultScene.js 【B担当】
// リザルト画面。SPACEでもう一度プレイ(Game)、ESCでスタート画面(Start)へ遷移する。

window.Game = window.Game || {};

class ResultScene extends Phaser.Scene {
  constructor() {
    super('Result');
  }

  init(data) {
    this.finalScore = (data && typeof data.score === 'number') ? data.score : 0;
    this.feverCount = (data && typeof data.feverCount === 'number') ? data.feverCount : 0;
  }

  preload() {
    this.load.image('menuBackground', Game.CONFIG.MENU_BACKGROUND_FILE);
  }

  create() {
    const c = Game.CONFIG;
    this.cameras.main.setBackgroundColor('#0a0a12');
    this.add.image(c.GAME_WIDTH / 2, c.GAME_HEIGHT / 2, 'menuBackground')
      .setDisplaySize(c.GAME_WIDTH, c.GAME_HEIGHT);

    this.add.text(c.GAME_WIDTH / 2, c.GAME_HEIGHT / 2 - 80, 'リザルト', Game.textStyle(36, { color: '#ffffff' }))
      .setOrigin(0.5);

    this.add.text(c.GAME_WIDTH / 2, c.GAME_HEIGHT / 2 - 20, `スコア：${this.finalScore}`, Game.textStyle(28, { color: '#ffff66' }))
      .setOrigin(0.5);

    this.add.text(c.GAME_WIDTH / 2, c.GAME_HEIGHT / 2 + 10, `フィーバーかいすう：${this.feverCount}`, Game.textStyle(16, { color: '#ff66aa' }))
      .setOrigin(0.5);

    this.add.text(c.GAME_WIDTH / 2, c.GAME_HEIGHT / 2 + 35, `レベル：${Game.LEVEL_LABELS[Game.state.level]}`, Game.textStyle(16, { color: '#88ccff' }))
      .setOrigin(0.5);

    this.add.text(c.GAME_WIDTH / 2, c.GAME_HEIGHT / 2 + 65, 'スペース：もういちどプレイ', Game.textStyle(18, { color: '#aaaaaa' }))
      .setOrigin(0.5);

    this.add.text(c.GAME_WIDTH / 2, c.GAME_HEIGHT / 2 + 95, 'エスケープ：スタートがめんへ', Game.textStyle(18, { color: '#aaaaaa' }))
      .setOrigin(0.5);

    this.input.keyboard.once('keydown-SPACE', () => {
      this.scene.start('Game');
    });

    this.input.keyboard.once('keydown-ESC', () => {
      this.scene.start('Start');
    });
  }
}
