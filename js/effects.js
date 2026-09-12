// effects.js 【C担当】
// 中央オブジェクト（建物）の演出を担当。
// 現在は動画素材が未用意のためプレースホルダー図形＋Tweenで代用。
// assets/ に動画を追加したら create() 内の rectangle を
// scene.add.video(...) 等に差し替えるだけで移行できるようにしてある。

window.Game = window.Game || {};

Game.Effects = {
  building: null,
  label: null,

  create(scene) {
    const c = Game.CONFIG;

    this.building = scene.add.rectangle(
      c.GAME_WIDTH / 2,
      c.GAME_HEIGHT / 2 + 40,
      160,
      200,
      0x8899aa
    ).setStrokeStyle(3, 0xccddee);

    this.label = scene.add.text(
      c.GAME_WIDTH / 2,
      c.GAME_HEIGHT / 2 + 40,
      '建物\n(placeholder)',
      { fontSize: '16px', color: '#0a0a12', align: 'center' }
    ).setOrigin(0.5);

    // 通常時：不安定に揺れているアイドルループ演出
    scene.tweens.add({
      targets: [this.building, this.label],
      angle: { from: -3, to: 3 },
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  },

  // スコア加算のタイミングでui.jsから呼ばれるアクション演出
  pulse(scene) {
    scene.tweens.add({
      targets: [this.building, this.label],
      scale: { from: 1, to: 1.12 },
      duration: 150,
      yoyo: true,
      ease: 'Quad.easeOut'
    });
  }
};
