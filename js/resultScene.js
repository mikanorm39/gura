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

    this.add.text(c.GAME_WIDTH / 2, c.GAME_HEIGHT / 2 - 80, 'リザルト', {
      fontSize: '36px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(c.GAME_WIDTH / 2, c.GAME_HEIGHT / 2 - 20, `Score: ${this.finalScore}`, {
      fontSize: '28px',
      color: '#ffff66'
    }).setOrigin(0.5);

    this.add.text(c.GAME_WIDTH / 2, c.GAME_HEIGHT / 2 + 10, `Fever回数: ${this.feverCount}`, {
      fontSize: '16px',
      color: '#ff66aa'
    }).setOrigin(0.5);

    this.add.text(c.GAME_WIDTH / 2, c.GAME_HEIGHT / 2 + 35, `Level: ${Game.LEVEL_LABELS[Game.state.level]}`, {
      fontSize: '16px',
      color: '#88ccff'
    }).setOrigin(0.5);

    this.add.text(c.GAME_WIDTH / 2, c.GAME_HEIGHT / 2 + 65, 'SPACE：もう一度プレイ', {
      fontSize: '18px',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    this.add.text(c.GAME_WIDTH / 2, c.GAME_HEIGHT / 2 + 95, 'ESC：スタート画面へ', {
      fontSize: '18px',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    this.input.keyboard.once('keydown-SPACE', () => {
      this.scene.start('Game');
    });

    this.input.keyboard.once('keydown-ESC', () => {
      this.scene.start('Start');
    });
  }
}
