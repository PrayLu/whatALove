/* 七片水晶先按收集顺序亮出（三片仍是迷雾），再翻开字母，拼成 LOVEFEI */
class RevealScene extends Phaser.Scene {
  constructor() { super('Reveal'); }

  create() {
    ensurePieceDeal(this.registry);
    this.cameras.main.setBackgroundColor('#10261c');
    this.cameras.main.fadeIn(600, 12, 38, 30);

    const { width, height } = this.scale;
    this.add.image(width / 2, height / 2, 'bg-forest').setDisplaySize(width, height).setAlpha(0.5);

    this.add.particles(0, 0, 'dot', {
      x: { min: 40, max: width - 40 },
      y: { min: 40, max: height - 80 },
      lifespan: 3500, speed: { min: 8, max: 22 },
      scale: { start: 1.6, end: 0.2 }, alpha: { start: 0.9, end: 0 },
      tint: [0xfff4c2, 0xe8c97a, 0xc8ffd4],
      frequency: 140, blendMode: 'ADD',
    });

    const deal = this.registry.get('pieceDeal');
    const mystery = this.registry.get('mysteryLevels') || [];
    const size = Math.min(88, width / 10);
    const gap = size * 0.22;
    const rowW = size * 7 + gap * 6;
    const rowY = height * 0.46;
    const rowX0 = (width - rowW) / 2 + size / 2;
    const font = '"PingFang SC", "Hiragino Sans GB", "Noto Sans SC", sans-serif';

    const used = [false, false, false, false, false, false, false];
    const destIndex = (letter) => {
      for (let i = 0; i < LOVE_WORD.length; i++) {
        if (LOVE_WORD[i] === letter && !used[i]) {
          used[i] = true;
          return i;
        }
      }
      return 0;
    };

    const fitCrystal = (img, box) => {
      const src = img.texture.getSourceImage();
      const ratio = src.width / Math.max(src.height, 1);
      if (ratio >= 1) img.setDisplaySize(box, box / ratio);
      else img.setDisplaySize(box * ratio, box);
      return img.scaleX;
    };

    const tiles = deal.map((key, i) => {
      const hidden = mystery.indexOf(i) !== -1;
      const img = this.add.image(rowX0 + i * (size + gap), rowY, hidden ? 'crystal-mystery' : 'crystal-shard')
        .setAlpha(0);
      fitCrystal(img, size);
      if (!hidden) img.setTint(CRYSTAL_TINT[key] || 0xffffff);
      img.setData('key', key);
      img.setData('hidden', hidden);
      img.setData('slot', destIndex(key));
      const label = this.add.text(img.x, img.y, hidden ? '' : key, {
        fontFamily: font, fontSize: `${Math.round(size * 0.42)}px`, color: '#1a3d2a', fontStyle: 'bold',
      }).setOrigin(0.5).setAlpha(0).setDepth(5);
      img.setData('label', label);
      return img;
    });

    tiles.forEach((img, i) => {
      this.tweens.add({
        targets: img, alpha: 1,
        duration: 450, delay: 200 + i * 160, ease: 'Back.easeOut',
      });
      if (!img.getData('hidden')) {
        this.tweens.add({
          targets: img.getData('label'), alpha: 1,
          duration: 450, delay: 280 + i * 160,
        });
      }
    });

    const hint = this.add.text(width / 2, 86, DIALOGUES.revealHint, {
      fontFamily: font, fontSize: '22px', color: '#f7ead0',
      shadow: { offsetX: 0, offsetY: 2, color: '#10261c', blur: 8, fill: true },
    }).setOrigin(0.5).setAlpha(0);
    this.tweens.add({ targets: hint, alpha: 1, delay: 400, duration: 600 });

    const tFlip = 200 + 7 * 160 + 900;
    this.time.delayedCall(tFlip, () => {
      this.tweens.add({ targets: hint, alpha: 0, duration: 300 });
      tiles.forEach((img) => {
        if (!img.getData('hidden')) return;
        this.tweens.add({
          targets: img, scaleX: 0, duration: 220,
          onComplete: () => {
            const key = img.getData('key');
            img.setTexture('crystal-shard');
            const sx = fitCrystal(img, size);
            img.scaleX = 0;
            img.setTint(CRYSTAL_TINT[key] || 0xffffff);
            img.getData('label').setText(key);
            this.tweens.add({ targets: img, scaleX: sx, duration: 220 });
            this.tweens.add({ targets: img.getData('label'), alpha: 1, duration: 220 });
          },
        });
      });
    });

    const tMove = tFlip + 900;
    this.time.delayedCall(tMove, () => {
      tiles.forEach((img) => {
        const i = img.getData('slot');
        const destX = rowX0 + i * (size + gap);
        const label = img.getData('label');
        this.tweens.add({
          targets: img, x: destX, y: rowY,
          duration: 700, ease: 'Cubic.easeInOut',
        });
        this.tweens.add({
          targets: label, x: destX, y: rowY,
          duration: 700, ease: 'Cubic.easeInOut',
        });
      });
    });

    const title = this.add.text(width / 2, 78, DIALOGUES.reveal, {
      fontFamily: font, fontSize: '52px', color: '#e8c97a', fontStyle: 'bold',
      shadow: { offsetX: 0, offsetY: 3, color: '#10261c', blur: 10, fill: true },
    }).setOrigin(0.5).setAlpha(0);

    this.time.delayedCall(tMove + 800, () => {
      this.tweens.add({ targets: title, alpha: 1, duration: 800 });
    });

    this.time.delayedCall(tMove + 2800, () => {
      this.cameras.main.fadeOut(800, 12, 38, 30);
      this.time.delayedCall(850, () => this.scene.start('Transform'));
    });
  }
}
