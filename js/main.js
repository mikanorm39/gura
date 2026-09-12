// main.js
// 各モジュール（indicator.js / ui.js / effects.js）と各画面（startScene.js / levelSelectScene.js / countdownScene.js / resultScene.js）を繋ぐ司令塔。
// 基本的にこのファイルは触らない。役割を追加・変更したい場合はチームに相談。
//
// 画面の流れ： Start → LevelSelect → Countdown → Game → Result → Start or Game
// （CountdownはGameを裏で並行起動(scene.launch)しておき、カウントダウンが終わって
// 　Gameの準備も整ったタイミングで'start-game'イベントを送ってバトンタッチする。
// 　Game中はESCキーでいつでもStartへ戻れる）

window.Game = window.Game || {};

class GameScene extends Phaser.Scene {
  constructor() {
    super('Game');
  }

  preload() {
    // レベル選択画面で先読みが完了していれば、ここではキャッシュ済みのため即座に完了する
    Game.Effects.preload(this);
    if (!this.cache.audio.exists('bgm')) this.load.audio('bgm', Game.CONFIG.BGM_FILE);
    if (!this.cache.audio.exists('feverBgm')) this.load.audio('feverBgm', Game.CONFIG.FEVER_BGM_FILE);
  }

  create() {
    Game.resetState();
    this.cameras.main.setBackgroundColor('#0a0a12');

    Game.Indicator.create(this);
    Game.Effects.create(this);
    Game.UI.create(this);

    const bgm = this.sound.add('bgm', { loop: true, volume: Game.CONFIG.BGM_VOLUME });
    const feverBgm = this.sound.add('feverBgm', { loop: true, volume: Game.CONFIG.FEVER_BGM_VOLUME });
    this.events.once('shutdown', () => {
      bgm.stop();
      feverBgm.stop();
    });

    // フィーバータイムの開始/終了時にui.jsから呼ばれる：通常BGMとフィーバーBGMを切り替える
    this.setFeverBgm = (active) => {
      if (active) {
        bgm.pause();
        feverBgm.play();
      } else {
        feverBgm.stop();
        bgm.resume();
      }
    };

    // ゲーム中にESCキーでタイトル画面へ戻れるようにする（カウントダウン中のCountdownも一緒に閉じる）
    this.input.keyboard.once('keydown-ESC', () => {
      this.scene.stop('Countdown');
      this.scene.start('Start');
    });

    // Countdown画面からの合図があるまでは時間・BGM・操作反映を止めておく。
    // （このcreate()が終わった時点でCountdown側に「Game準備完了」の合図(CREATEイベント)が届く）
    this.countdownActive = true;
    this.events.once('start-game', () => {
      this.countdownActive = false;
      Game.UI.startTimers(this);
      bgm.play();
    });
  }

  update(time, delta) {
    if (this.countdownActive || Game.state.gameOver) return;
    Game.Indicator.update(this, time, delta);
    Game.UI.update(this, time, delta);
    Game.Effects.update(this);
  }
}

const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  backgroundColor: '#0a0a12',
  // ブラウザいっぱいに表示しつつ、内部解像度(GAME_WIDTH x GAME_HEIGHT)を
  // 保ったまま拡大縮小する（テキストやassetsも一緒に比率が変わる）。
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: Game.CONFIG.GAME_WIDTH,
    height: Game.CONFIG.GAME_HEIGHT
  },
  scene: [StartScene, LevelSelectScene, CountdownScene, GameScene, ResultScene]
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
