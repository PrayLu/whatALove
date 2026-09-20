/* ============================================================
 *  变身过场：红斗篷旅人消散，露出真正的男孩
 * ============================================================ */
class TransformScene extends Phaser.Scene {
  constructor() { super('Transform'); }

  create() {
    this.cameras.main.setBackgroundColor('#10261c');
    this.cameras.main.fadeIn(700, 12, 38, 30);

    const { width, height } = this.scale;
    const cx = width / 2;
    const cy = height / 2 - 10;

    this.add.image(cx, cy, 'bg-forest').setDisplaySize(width, height).setAlpha(0.55);

    [-30, width - 10].forEach((x, i) => {
      const v = this.add.image(x, -8, 'vine').setOrigin(0.5, 0).setScale(0.24);
      if (i) v.setFlipX(true);
      this.tweens.add({
        targets: v, angle: i ? 5 : -5, duration: 3000, yoyo: true, repeat: -1, ease: 'Sine.inOut',
      });
    });

    const halo = this.add.graphics();
    halo.fillStyle(0xfff4c2, 0.08);
    halo.fillCircle(cx, cy, 190);

    const masked = this.add.sprite(cx, cy + 80, 'hero', 0)
      .setOrigin(0.5, 1).setScale(0.38).play('hero-idle');

    const boy = this.add.sprite(cx, cy + 90, 'boy-walk', 2)
      .setOrigin(0.5, 1).setAlpha(0).setScale(0.34);

    const line = this.add.text(cx, height - 90, '', {
      fontSize: '26px', color: '#f7ead0', align: 'center',
      shadow: { offsetX: 0, offsetY: 2, color: '#1a3d2a', blur: 8, fill: true },
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: masked, y: masked.y - 8, duration: 900, yoyo: true, repeat: 1, ease: 'Sine.inOut',
    });

    this.time.delayedCall(2200, () => {
      const emitter = this.add.particles(cx, cy + 20, 'dot', {
        speed: { min: 50, max: 200 }, lifespan: 1000, quantity: 48,
        scale: { start: 2.4, end: 0 }, tint: [0xc23b3b, 0xe8c97a, 0x3a3355],
        blendMode: 'ADD',
      });
      this.time.delayedCall(1100, () => emitter.destroy());
      this.tweens.add({
        targets: masked, alpha: 0, scale: 0.18, duration: 800,
        onComplete: () => masked.destroy(),
      });
    });

    this.time.delayedCall(2700, () => {
      this.cameras.main.flash(280, 255, 244, 194);
      this.tweens.add({
        targets: boy, alpha: 1, scale: 0.38,
        duration: 700, ease: 'Back.easeOut',
      });
      const sparkle = this.add.particles(cx, cy - 20, 'dot', {
        speed: { min: 60, max: 240 }, lifespan: 800, quantity: 32,
        scale: { start: 2, end: 0 }, tint: [0xffffff, 0xfff4c2, 0xe8c97a],
        blendMode: 'ADD',
      });
      this.time.delayedCall(900, () => sparkle.destroy());
    });

    this.time.delayedCall(3600, () => {
      line.setText(DIALOGUES.unmask);
      this.tweens.add({ targets: line, alpha: 1, duration: 900 });
    });

    this.time.delayedCall(5800, () => {
      this.cameras.main.fadeOut(800, 12, 38, 30);
      this.time.delayedCall(850, () => this.scene.start('Ending'));
    });
  }
}
