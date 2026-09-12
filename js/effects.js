// effects.js 【C担当】
// 背景（空・海・セイレーン）、中央オブジェクト（建物）、落下オブジェクトの放出演出を担当。
// 建物画像：3種類（assets/building_1〜3.png）、スコアに応じて自動的に切り替える。
// 落下オブジェクト：犯人2種＋青ガチャ・黄ガチャは常に出現候補、緑ガチャ・赤ガチャはフィーバー中のみ出現候補。
//           ゾーン内滞在中に建物を起点として放物線を描きながらランダムに落下する（フィーバー中は2体同時）。
// セイレーンは普段は空の裏に隠れており（アルファ0）、フィーバー中だけフェード表示される。

window.Game = window.Game || {};

Game.Effects = {
  building: null,
  siren: null,

  preload(scene) {
    const c = Game.CONFIG;
    c.BUILDING_IMAGE_KEYS.forEach((key, i) => {
      scene.load.image(key, c.BUILDING_IMAGE_FILES[i]);
    });
    c.SUSPECT_IMAGE_KEYS.forEach((key, i) => {
      scene.load.image(key, c.SUSPECT_IMAGE_FILES[i]);
    });
    c.FEVER_SUSPECT_IMAGE_KEYS.forEach((key, i) => {
      scene.load.image(key, c.FEVER_SUSPECT_IMAGE_FILES[i]);
    });
    scene.load.image('sky', c.SKY_IMAGE_FILE);
    scene.load.image('sea', c.SEA_IMAGE_FILE);
    scene.load.image('siren', c.SIREN_IMAGE_FILE);
  },

  create(scene) {
    const c = Game.CONFIG;

    this.baseX = c.GAME_WIDTH / 2;

    // 空：最背面
    scene.add.image(c.GAME_WIDTH / 2, c.GAME_HEIGHT / 2, 'sky')
      .setDisplaySize(c.GAME_WIDTH, c.GAME_HEIGHT)
      .setDepth(c.DEPTH_SKY);

    // 空を暗くする黒いオーバーレイ（フィーバー中だけ濃く表示する）
    this.skyOverlay = scene.add.rectangle(c.GAME_WIDTH / 2, c.GAME_HEIGHT / 2, c.GAME_WIDTH, c.GAME_HEIGHT, 0x000000)
      .setDepth(c.DEPTH_SKY_OVERLAY)
      .setAlpha(0);

    // セイレーン：空より手前の depth に置きつつ、普段はアルファ0で隠しておく
    this.siren = scene.add.image(c.GAME_WIDTH / 2, c.GAME_HEIGHT / 2, 'siren')
      .setDisplaySize(c.SIREN_DISPLAY_WIDTH, c.SIREN_DISPLAY_HEIGHT)
      .setDepth(c.DEPTH_SIREN)
      .setAlpha(0);

    this.building = scene.add.image(
      this.baseX,
      c.BUILDING_Y,
      c.BUILDING_IMAGE_KEYS[0]
    ).setDisplaySize(c.BUILDING_DISPLAY_WIDTH, c.BUILDING_DISPLAY_HEIGHT)
      .setDepth(c.DEPTH_BUILDING);

    // 海：建物にかぶさるように手前へ
    scene.add.image(c.GAME_WIDTH / 2, c.SEA_Y, 'sea')
      .setDisplaySize(c.GAME_WIDTH, c.SEA_DISPLAY_HEIGHT)
      .setDepth(c.DEPTH_SEA);

    // 通常時：地震のような不規則な横揺れ（滑らかなTweenではなく短い間隔でランダムに位置をずらす）
    scene.time.addEvent({
      delay: c.BUILDING_SHAKE_INTERVAL,
      loop: true,
      callback: () => {
        this.building.x = this.baseX + Phaser.Math.Between(-c.BUILDING_SHAKE_AMPLITUDE, c.BUILDING_SHAKE_AMPLITUDE);
      }
    });
  },

  // フィーバーの開始/終了時にui.jsから呼ばれる：セイレーンをフェード表示/非表示にしつつ、空を暗くする
  setFeverVisual(scene, active) {
    const c = Game.CONFIG;

    scene.tweens.killTweensOf(this.siren);
    scene.tweens.add({
      targets: this.siren,
      alpha: active ? 1 : 0,
      duration: c.SIREN_FADE_DURATION,
      ease: 'Sine.easeInOut'
    });

    scene.tweens.killTweensOf(this.skyOverlay);
    scene.tweens.add({
      targets: this.skyOverlay,
      alpha: active ? c.FEVER_SKY_DARKNESS : 0,
      duration: c.SIREN_FADE_DURATION,
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

  // SUSPECT_TRAJECTORIESのweightに応じた重み付き抽選で1パターン選ぶ
  pickTrajectory(c) {
    const list = c.SUSPECT_TRAJECTORIES;
    const totalWeight = list.reduce((sum, t) => sum + t.weight, 0);
    let roll = Phaser.Math.FloatBetween(0, totalWeight);
    for (const trajectory of list) {
      roll -= trajectory.weight;
      if (roll <= 0) return trajectory;
    }
    return list[list.length - 1];
  },

  // スコア加算のタイミングでui.jsから呼ばれる演出：建物を起点に犯人オブジェクトを放物線で落下させる
  // フィーバー中(Game.state.feverActive)は1体ではなく2体同時に放出する
  spawnSuspect(scene) {
    const count = Game.state.feverActive ? 2 : 1;
    for (let i = 0; i < count; i++) {
      this.dropOneSuspect(scene);
    }
  },

  dropOneSuspect(scene) {
    const c = Game.CONFIG;

    // フィーバー中は緑ガチャ・赤ガチャも出現候補に加わる
    const pool = Game.state.feverActive
      ? c.SUSPECT_IMAGE_KEYS.concat(c.FEVER_SUSPECT_IMAGE_KEYS)
      : c.SUSPECT_IMAGE_KEYS;
    const key = Phaser.Utils.Array.GetRandom(pool);
    const trajectory = this.pickTrajectory(c);
    const startX = this.building.x;
    const startY = this.building.y;
    // 真下に落ちて見えないよう、左右どちらかへ最低でも範囲の半分は飛ばす
    const horizontalDir = Phaser.Math.RND.pick([-1, 1]);
    const endX = startX + horizontalDir * Phaser.Math.Between(trajectory.horizontalRange * 0.5, trajectory.horizontalRange);
    const endY = startY + c.SUSPECT_FALL_DISTANCE;
    const spinDir = Phaser.Math.RND.pick([-1, 1]);

    const suspect = scene.add.image(startX, startY, key)
      .setDisplaySize(c.SUSPECT_DISPLAY_WIDTH, c.SUSPECT_DISPLAY_HEIGHT)
      .setDepth(c.DEPTH_SUSPECT);

    scene.tweens.addCounter({
      from: 0,
      to: 1,
      duration: trajectory.duration,
      ease: 'Linear',
      onUpdate: (tween) => {
        const t = tween.getValue();
        suspect.x = Phaser.Math.Linear(startX, endX, t);
        // 放物線：t=0で開始位置、t=1で着地位置、中間で arcHeight ぶん上に膨らむ
        suspect.y = Phaser.Math.Linear(startY, endY, t) - 4 * trajectory.arcHeight * t * (1 - t);
        suspect.angle = spinDir * c.SUSPECT_SPIN_DEGREES * t;
      },
      onComplete: () => suspect.destroy()
    });
  }
};
