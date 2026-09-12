// main.js
// 各モジュール（indicator.js / ui.js / effects.js）と各画面（startScene.js / resultScene.js）を繋ぐ司令塔。
// 基本的にこのファイルは触らない。役割を追加・変更したい場合はチームに相談。
//
// 画面の流れ： Start → Game → Result → Start or Game

window.Game = window.Game || {};

class GameScene extends Phaser.Scene {
  constructor() {
    super('Game');
  }

  create() {
    Game.resetState();
    this.cameras.main.setBackgroundColor('#0a0a12');

    Game.Indicator.create(this);
    Game.Effects.create(this);
    Game.UI.create(this);
  }

  update(time, delta) {
    if (Game.state.gameOver) return;
    Game.Indicator.update(this, time, delta);
    Game.UI.update(this, time, delta);
  }
}

const config = {
  type: Phaser.AUTO,
  width: Game.CONFIG.GAME_WIDTH,
  height: Game.CONFIG.GAME_HEIGHT,
  parent: 'game-container',
  backgroundColor: '#0a0a12',
  scene: [StartScene, GameScene, ResultScene]
};

new Phaser.Game(config);
