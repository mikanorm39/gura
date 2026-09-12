// main.js
// 各モジュール（indicator.js / ui.js / effects.js）と各画面（startScene.js / levelSelectScene.js / resultScene.js）を繋ぐ司令塔。
// 基本的にこのファイルは触らない。役割を追加・変更したい場合はチームに相談。
//
// 画面の流れ： Start → LevelSelect → Game → Result → Start or Game
// （Game中はESCキーでいつでもStartへ戻れる）

window.Game = window.Game || {};

class GameScene extends Phaser.Scene {
  constructor() {
    super('Game');
  }

  preload() {
    Game.Effects.preload(this);
    this.load.audio('bgm', Game.CONFIG.BGM_FILE);
  }

  create() {
    Game.resetState();
    this.cameras.main.setBackgroundColor('#0a0a12');

    Game.Indicator.create(this);
    Game.Effects.create(this);
    Game.UI.create(this);

    // ゲーム開始と同時にBGMを再生し、この画面を離れるタイミングで停止する
    const bgm = this.sound.add('bgm', { loop: true, volume: Game.CONFIG.BGM_VOLUME });
    bgm.play();
    this.events.once('shutdown', () => bgm.stop());

    // ゲーム中にESCキーでタイトル画面へ戻れるようにする
    this.input.keyboard.once('keydown-ESC', () => {
      this.scene.start('Start');
    });
  }

  update(time, delta) {
    if (Game.state.gameOver) return;
    Game.Indicator.update(this, time, delta);
    Game.UI.update(this, time, delta);
    Game.Effects.update(this);
  }
}

const config = {
  type: Phaser.AUTO,
  width: Game.CONFIG.GAME_WIDTH,
  height: Game.CONFIG.GAME_HEIGHT,
  parent: 'game-container',
  backgroundColor: '#0a0a12',
  scene: [StartScene, LevelSelectScene, GameScene, ResultScene]
};

// カスタムフォント（Chika）を読み込んでからゲームを開始する（未読み込みだと初回描画が既定フォントになるため）
function startGame() {
  new Phaser.Game(config);
}

if (document.fonts && document.fonts.load) {
  document.fonts.load(`16px "Chika"`).then(startGame).catch(startGame);
} else {
  startGame();
}
