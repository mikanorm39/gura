// levelSelectScene.js 【B担当】
// レベル選択画面。↑↓で選択、SPACEで決定してゲーム画面(Game)へ遷移する。

window.Game = window.Game || {};

class LevelSelectScene extends Phaser.Scene {
  constructor() {
    super('LevelSelect');
  }

  preload() {
    this.load.image('menuBackground', Game.CONFIG.MENU_BACKGROUND_FILE);
  }

  create() {
    const c = Game.CONFIG;
    this.cameras.main.setBackgroundColor('#0a0a12');
    this.add.image(c.GAME_WIDTH / 2, c.GAME_HEIGHT / 2, 'menuBackground')
      .setDisplaySize(c.GAME_WIDTH, c.GAME_HEIGHT);

    this.options = ['normal', 'hard'];
    this.selectedIndex = Math.max(this.options.indexOf(Game.state.level), 0);

    this.add.text(c.GAME_WIDTH / 2, c.GAME_HEIGHT / 2 - 120, 'レベル選択', {
      fontSize: '36px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.optionTexts = this.options.map((key, i) =>
      this.add.text(c.GAME_WIDTH / 2, c.GAME_HEIGHT / 2 - 30 + i * 50, '', {
        fontSize: '26px',
        color: '#aaaaaa'
      }).setOrigin(0.5)
    );

    this.descText = this.add.text(c.GAME_WIDTH / 2, c.GAME_HEIGHT / 2 + 90, '', {
      fontSize: '16px',
      color: '#88ccff'
    }).setOrigin(0.5);

    this.add.text(c.GAME_WIDTH / 2, c.GAME_HEIGHT / 2 + 140, '↑↓：選択　SPACE：決定', {
      fontSize: '14px',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    this.refreshSelection();

    this.input.keyboard.on('keydown-UP', () => this.moveSelection(-1));
    this.input.keyboard.on('keydown-DOWN', () => this.moveSelection(1));
    this.input.keyboard.once('keydown-SPACE', () => this.confirmSelection());
  }

  moveSelection(delta) {
    this.selectedIndex = Phaser.Math.Wrap(this.selectedIndex + delta, 0, this.options.length);
    this.refreshSelection();
  }

  refreshSelection() {
    this.options.forEach((key, i) => {
      const selected = i === this.selectedIndex;
      this.optionTexts[i].setColor(selected ? '#ffff66' : '#aaaaaa');
      this.optionTexts[i].setText((selected ? '▶ ' : '　') + Game.LEVEL_LABELS[key]);
    });
    this.descText.setText(Game.LEVEL_DESCRIPTIONS[this.options[this.selectedIndex]]);
  }

  confirmSelection() {
    Game.applyLevel(this.options[this.selectedIndex]);
    this.scene.start('Game');
  }
}
