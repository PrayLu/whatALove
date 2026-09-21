/* 启动场景：加载林间漫画风素材、标题页 */
class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }

  preload() {
    const { width, height } = this.scale;
    const hint = document.getElementById('boot-hint');
    const barBg = this.add.rectangle(width / 2, height / 2, 240, 8, 0x1a3d2a);
    const bar = this.add.rectangle(width / 2 - 118, height / 2, 4, 6, 0xe8c97a).setOrigin(0, 0.5);
    const label = this.add.text(width / 2, height / 2 + 28, '正在前往世界各地…', {
      fontSize: '16px', color: '#d5efc8',
    }).setOrigin(0.5);

    this.load.setBaseURL(window.ASSET_BASE || new URL('./', window.location.href).href);
    this.load.maxParallelDownloads = 4;

    const paint = (p) => {
      const pct = Math.max(0, Math.min(100, Math.round(p * 100)));
      bar.width = 4 + 232 * (pct / 100);
      const text = '正在前往世界各地… ' + pct + '%';
      label.setText(text);
      if (hint) hint.textContent = text;
    };
    this.load.on('progress', (p) => paint(p));
    this.load.on('fileprogress', (file, value) => {
      const done = this.load.totalComplete + (value || 0);
      const total = this.load.totalToLoad || 1;
      paint(done / total);
    });
    this.load.on('loaderror', (file) => {
      const name = (file && (file.key || file.src)) || '素材';
      const text = '素材加载失败：' + name + '，请刷新重试';
      label.setText(text);
      if (hint) hint.textContent = text;
    });
    this.load.on('complete', () => { if (hint) hint.remove(); });

    this.load.spritesheet('boy-walk', 'assets/boy-walk-sheet.png', { frameWidth: 360, frameHeight: 532 });
    this.load.image('sleep-girl', 'assets/sleep-girl.png');
    this.load.image('girl-happy', 'assets/girlhappy.png');
    this.load.image('bg-forest', 'assets/bg-forest.jpg');
    this.load.image('bg-level1', 'assets/bg-level1.jpg');
    this.load.image('bg-beach', 'assets/bg-beach.jpg');
    this.load.image('bg-desert', 'assets/bg-desert.jpg');
    this.load.image('bg-snow', 'assets/bg-snow.jpg');
    this.load.image('bg-flowers', 'assets/bg-flowers.jpg');
    this.load.image('bg-town', 'assets/bg-town.jpg');
    this.load.image('bg-aurora', 'assets/bg-aurora.jpg');
    this.load.image('bg-ending', 'assets/bg-ending.jpg');
    this.load.image('tile-moss', 'assets/tile-moss.png');
    this.load.image('vine', 'assets/vine.png');
    this.load.spritesheet('hero', 'assets/hero-sheet.png', { frameWidth: 318, frameHeight: 432 });
    this.load.image('glow-flower', 'assets/glow-flower.png');
    this.load.image('portal', 'assets/portal.png');
    this.load.image('flower-bed', 'assets/flower-bed.png');
    this.load.image('foliage', 'assets/foliage.png');
    this.load.image('rabbit', 'assets/rabbit-use.png');
    this.load.image('bird', 'assets/bird-use.png');
    this.load.image('fruit-berry', 'assets/fruit-berry-use.png');
    this.load.image('crab', 'assets/crab-use.png');
    this.load.image('seagull', 'assets/seagull-use.png');
    this.load.image('shell', 'assets/shell-use.png');
    this.load.image('lizard', 'assets/lizard-use.png');
    this.load.image('cactus-bloom', 'assets/cactus-bloom-use.png');
    this.load.image('snow-hare', 'assets/snow-hare-use.png');
    this.load.image('cat', 'assets/cat-use.png');
    this.load.image('lantern', 'assets/lantern-use.png');
    this.load.image('deer', 'assets/deer-use.png');
    this.load.image('ice-bloom', 'assets/ice-bloom-use.png');
    this.load.image('wildflower', 'assets/wildflower-use.png');
    this.load.image('crystal-shard', 'assets/crystal-shard-use.png');
    this.load.image('crystal-empty', 'assets/crystal-empty-use.png');
    this.load.image('crystal-mystery', 'assets/crystal-mystery-use.png');
    this.load.audio('bgm', ['backgroundmusic.m4a', 'backgroundmusic.mp3']);
  }

  create() {
    this.makeTextures();
    this.createHeroAnims();
    ensurePieceDeal(this.registry);

    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor('#10261c');

    const bg = this.add.image(width / 2, height / 2, 'bg-forest').setDisplaySize(width, height);
    this.tweens.add({
      targets: bg, scaleX: bg.scaleX * 1.03, scaleY: bg.scaleY * 1.03,
      duration: 8000, yoyo: true, repeat: -1, ease: 'Sine.inOut',
    });

    // 前景藤蔓轻轻摇
    [-40, width * 0.55, width - 20].forEach((x, i) => {
      const v = this.add.image(x, -10, 'vine').setOrigin(0.5, 0).setScale(0.22 + i * 0.03).setAlpha(0.9);
      if (i === 1) v.setFlipX(true);
      this.tweens.add({
        targets: v, angle: i % 2 ? 5 : -5,
        duration: 3200 + i * 400, yoyo: true, repeat: -1, ease: 'Sine.inOut',
      });
    });

    this.addFireflies(width, height);

    const hero = this.add.sprite(width / 2, height / 2 - 70, 'hero', 0)
      .setScale(0.32).setOrigin(0.5, 1).play('hero-idle');

    this.add.text(width / 2, height / 2 + 20, DIALOGUES.title, {
      fontSize: '52px', color: '#f7ead0', fontStyle: 'bold',
      shadow: { offsetX: 0, offsetY: 3, color: '#1a3d2a', blur: 10, fill: true },
    }).setOrigin(0.5);

    const isTouch = this.sys.game.device.input.touch;
    this.add.text(width / 2, height / 2 + 70, isTouch ? '◀ ▶ 移动    ⤒ 跳跃    集齐七个水晶即可解锁' : DIALOGUES.subtitle, {
      fontSize: '16px', color: '#d5efc8',
    }).setOrigin(0.5);

    const start = this.add.text(width / 2, height / 2 + 130, '▶ 开始散步', {
      fontSize: '24px', color: '#1a3d2a',
      backgroundColor: '#e8c97a', padding: { x: 28, y: 12 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    this.tweens.add({
      targets: start, alpha: 0.75, duration: 900, yoyo: true, repeat: -1,
    });

    start.on('pointerdown', () => this.beginGame(0));
    this.input.keyboard.once('keydown', () => this.beginGame(0));

    const params = new URLSearchParams(location.search);
    if (params.has('auto')) {
      const v = params.get('auto');
      if (v === 'reveal' || v === 'transform' || v === 'ending') {
        this.scene.start(v.charAt(0).toUpperCase() + v.slice(1));
        this.startBgm();
      } else {
        const lv = Phaser.Math.Clamp(parseInt(v || '0', 10) || 0, 0, 6);
        this.beginGame(lv);
      }
    }
  }

  beginGame(level) {
    if (this._started) return;
    this._started = true;
    ensurePieceDeal(this.registry);
    this.startBgm();
    this.scene.start('Level', { level });
  }

  startBgm() {
    const play = () => {
      this.sound.mute = window.MUSIC_ON === false;
      if (this.sound.get('bgm')?.isPlaying) return;
      this.sound.unlock();
      this.sound.play('bgm', { loop: true, volume: 0.42 });
    };
    this.sound.unlock();
    if (this.cache.audio.exists('bgm')) play();
    else this.load.once('complete', play);
  }

  addFireflies(width, height) {
    this.add.particles(0, 0, 'dot', {
      x: { min: 40, max: width - 40 },
      y: { min: 40, max: height - 80 },
      lifespan: 3500,
      speed: { min: 6, max: 22 },
      scale: { start: 1.6, end: 0.2 },
      alpha: { start: 0.95, end: 0 },
      tint: [0xfff4c2, 0xc8ffd4, 0xffe08a],
      frequency: 140,
      blendMode: 'ADD',
    });
  }

  createHeroAnims() {
    if (this.anims.exists('hero-idle')) return;
    this.anims.create({
      key: 'hero-idle',
      frames: this.anims.generateFrameNumbers('hero', { start: 0, end: 3 }),
      frameRate: 5, repeat: -1,
    });
    this.anims.create({
      key: 'hero-run',
      frames: this.anims.generateFrameNumbers('hero', { start: 4, end: 9 }),
      frameRate: 11, repeat: -1,
    });
    this.anims.create({
      key: 'hero-jump',
      frames: [{ key: 'hero', frame: 11 }],
      frameRate: 8, repeat: -1,
    });
    this.anims.create({
      key: 'hero-fall',
      frames: [{ key: 'hero', frame: 12 }],
      frameRate: 8, repeat: -1,
    });
    if (!this.anims.exists('boy-carry-walk')) {
      this.anims.create({
        key: 'boy-carry-walk',
        frames: [
          { key: 'boy-walk', frame: 0 },
          { key: 'boy-walk', frame: 1 },
          { key: 'boy-walk', frame: 2 },
          { key: 'boy-walk', frame: 1 },
        ],
        frameRate: 6, repeat: -1,
      });
      this.anims.create({
        key: 'boy-carry-idle',
        frames: [{ key: 'boy-walk', frame: 2 }],
        frameRate: 4, repeat: -1,
      });
    }
  }

  makeTextures() {
    const g = this.make.graphics({ add: false });

    g.fillStyle(0xffffff);
    g.fillCircle(4, 4, 4);
    g.generateTexture('dot', 8, 8);
    g.clear();

    g.fillStyle(0x1b3324);
    g.fillRect(0, 0, 48, 48);
    g.generateTexture('tile-hit', 48, 48);
    g.clear();
    g.destroy();
  }
}
