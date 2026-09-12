// effects.js 【C担当】
// 中央オブジェクト（建物）の演出を担当。
// 3種類の画像（assets/building_1.png 〜 building_3.png）を読み込み、
// スコアが一定値に到達するたびに自動的に切り替える。

window.Game = window.Game || {};

Game.Effects = {
  building: null,

  preload(scene) {
    const c = Game.CONFIG;
    c.BUILDING_IMAGE_KEYS.forEach((key, i) => {
      scene.load.image(key, c.BUILDING_IMAGE_FILES[i]);
    });
  },

  create(scene) {
    const c = Game.CONFIG;

    this.building = scene.add.image(
      c.GAME_WIDTH / 2,
      c.GAME_HEIGHT / 2 + 40,
      c.BUILDING_IMAGE_KEYS[0]
    ).setDisplaySize(c.BUILDING_DISPLAY_WIDTH, c.BUILDING_DISPLAY_HEIGHT);

    // 通常時：不安定に揺れているアイドルループ演出
    scene.tweens.add({
      targets: this.building,
      angle: { from: -3, to: 3 },
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  },

  // スコアが閾値(BUILDING_SCORE_THRESHOLDS)に到達するたびに建物画像を切り替える
  update(scene) {
    const c = Game.CONFIG;
    const s = Game.state;

    let stage = 0;
    for (let i = 0; i < c.BUILDING_SCORE_THRESHOLDS.length; i++) {
      if (s.score >= c.BUILDING_SCORE_THRESHOLDS[i]) stage = i + 1;
    }

    if (stage !== s.buildingStage) {
      s.buildingStage = stage;
      this.building.setTexture(c.BUILDING_IMAGE_KEYS[stage]);
      this.building.setDisplaySize(c.BUILDING_DISPLAY_WIDTH, c.BUILDING_DISPLAY_HEIGHT);
    }
  },

  // スコア加算のタイミングでui.jsから呼ばれるアクション演出
  pulse(scene) {
    const baseScaleX = this.building.scaleX;
    const baseScaleY = this.building.scaleY;
    scene.tweens.add({
      targets: this.building,
      scaleX: { from: baseScaleX, to: baseScaleX * 1.12 },
      scaleY: { from: baseScaleY, to: baseScaleY * 1.12 },
      duration: 150,
      yoyo: true,
      ease: 'Quad.easeOut'
    });
  }
};
