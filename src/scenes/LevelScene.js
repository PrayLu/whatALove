/* ============================================================
 *  七关：每关一块打乱的字母拼图，其中三块是神秘拼图
 *  # 平台  S 出生  D 出口  P 拼图  H 心花
 * ============================================================ */

function padMap(rows) {
  const w = Math.max(...rows.map((r) => r.length));
  return rows.map((r) => r.padEnd(w, ' '));
}

const LEVELS = [
  {
    type: 'scene', name: 'forest', color: 0x8eecc4, bg: 'bg-level1',
    size: LEVEL1_SIZE, platforms: LEVEL1_PLATFORMS,
    spawn: LEVEL1_SPAWN, piece: LEVEL1_PIECE, door: LEVEL1_DOOR,
    fruits: LEVEL1_FRUITS, rabbits: LEVEL1_RABBITS,
    theme: { critter: 'rabbit', pick: 'fruit-berry', flyer: 'bird', weather: 'firefly' },
  },
  {
    type: 'scene', name: 'beach', color: 0x7ecbff, bg: 'bg-beach',
    size: LEVEL2_SIZE, platforms: LEVEL2_PLATFORMS,
    spawn: LEVEL2_SPAWN, piece: LEVEL2_PIECE, door: LEVEL2_DOOR,
    fruits: LEVEL2_FRUITS, rabbits: LEVEL2_RABBITS,
    theme: { critter: 'crab', pick: 'shell', flyer: 'seagull', weather: 'spray' },
  },
  {
    type: 'scene', name: 'desert', color: 0xffb56a, bg: 'bg-desert',
    size: LEVEL3_SIZE, platforms: LEVEL3_PLATFORMS,
    spawn: LEVEL3_SPAWN, piece: LEVEL3_PIECE, door: LEVEL3_DOOR,
    fruits: LEVEL3_FRUITS, rabbits: LEVEL3_RABBITS,
    theme: { critter: 'lizard', pick: 'cactus-bloom', flyer: 'bird', weather: 'dust' },
  },
  {
    type: 'scene', name: 'snow', color: 0xf5f1e6, bg: 'bg-snow',
    size: LEVEL4_SIZE, platforms: LEVEL4_PLATFORMS,
    spawn: LEVEL4_SPAWN, piece: LEVEL4_PIECE, door: LEVEL4_DOOR,
    fruits: LEVEL4_FRUITS, rabbits: LEVEL4_RABBITS,
    theme: { critter: 'snow-hare', pick: 'ice-bloom', flyer: 'bird', weather: 'snow' },
  },
  {
    type: 'scene', name: 'flowers', color: 0xff8eb0, bg: 'bg-flowers',
    size: LEVEL5_SIZE, platforms: LEVEL5_PLATFORMS,
    spawn: LEVEL5_SPAWN, piece: LEVEL5_PIECE, door: LEVEL5_DOOR,
    fruits: LEVEL5_FRUITS, rabbits: LEVEL5_RABBITS,
    theme: { critter: 'rabbit', pick: 'wildflower', flyer: 'bird', weather: 'petals' },
  },
  {
    type: 'scene', name: 'town', color: 0xffe08a, bg: 'bg-town',
    size: LEVEL6_SIZE, platforms: LEVEL6_PLATFORMS,
    spawn: LEVEL6_SPAWN, piece: LEVEL6_PIECE, door: LEVEL6_DOOR,
    fruits: LEVEL6_FRUITS, rabbits: LEVEL6_RABBITS,
    theme: { critter: 'cat', pick: 'lantern', flyer: 'bird', weather: 'lamps' },
  },
  {
    type: 'scene', name: 'aurora', color: 0xc9a6ff, bg: 'bg-aurora',
    size: LEVEL7_SIZE, platforms: LEVEL7_PLATFORMS,
    spawn: LEVEL7_SPAWN, piece: LEVEL7_PIECE, door: LEVEL7_DOOR,
    fruits: LEVEL7_FRUITS, rabbits: LEVEL7_RABBITS,
    theme: { critter: 'deer', pick: 'ice-bloom', flyer: 'bird', weather: 'aurora' },
  },
];

const TILE = 48;
const MOVE_SPEED = 260;
const JUMP_VEL = -560;
const COYOTE_MS = 90;
const JUMP_BUFFER_MS = 120;
const HERO_SCALE = 0.24;
const FADE = { r: 12, g: 38, b: 30 };

class LevelScene extends Phaser.Scene {
  constructor() { super('Level'); }

  init(data) {
    ensurePieceDeal(this.registry);
    this.levelIndex = data.level || 0;
    this.level = LEVELS[this.levelIndex];
    this.pieceKey = this.registry.get('pieceDeal')[this.levelIndex];
    this.isMystery = (this.registry.get('mysteryLevels') || []).indexOf(this.levelIndex) !== -1;
    this.gotPiece = !!(this.registry.get('pieces') || [])[this.levelIndex];
  }

  create() {
    document.body.classList.add('show-touch-pad');
    this.events.once('shutdown', () => document.body.classList.remove('show-touch-pad'));
    this.cameras.main.setBackgroundColor('#10261c');
    this.pieceGot = !!this.gotPiece;
    this.platforms = this.physics.add.staticGroup();
    this.hearts = this.physics.add.staticGroup();

    let spawn, doorPos, piecePos;
    if (this.level.type === 'scene') {
      const built = this.createPaintedScene();
      spawn = built.spawn;
      doorPos = built.door;
      piecePos = built.piece;
    } else {
      const built = this.createTileScene();
      spawn = built.spawn;
      doorPos = built.door;
      piecePos = built.piece;
    }

    const atX = parseInt(new URLSearchParams(location.search).get('at') || '', 10);
    if (atX > 0 && this.level.platforms) {
      const near = this.level.platforms.reduce((best, p) => (
        !best || Math.abs(p.x - atX) < Math.abs(best.x - atX) ? p : best
      ), null);
      spawn = { x: atX, y: near ? near.y - near.h / 2 - 52 : spawn.y };
    }
    this.spawnPoint = spawn;
    this.heroScale = this.heroScale || HERO_SCALE;
    this.jumpVel = this.jumpVel || JUMP_VEL;
    this.player = this.physics.add.sprite(spawn.x, spawn.y, 'hero', 0);
    this.player.setScale(this.heroScale);
    this.player.setDepth(10);
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(72, 160);
    this.player.body.setOffset(123, 250);
    this.player.body.setMaxVelocity(360, 900);
    this.player.play('hero-idle');
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.overlap(this.player, this.hearts, this.collectHeart, null, this);

    if (piecePos && !this.pieceGot) {
      const tex = this.isMystery ? 'crystal-mystery' : 'crystal-shard';
      this.worldPiece = this.physics.add.staticSprite(piecePos.x, piecePos.y, tex);
      this.worldPiece.setScale(0.07).setDepth(8).refreshBody();
      if (!this.isMystery) this.worldPiece.setTint(CRYSTAL_TINT[this.pieceKey] || 0xffffff);
      this.worldPiece.body.setSize(this.worldPiece.displayWidth * 0.55, this.worldPiece.displayHeight * 0.55);
      this.tweens.add({
        targets: this.worldPiece, y: piecePos.y - 8, angle: 5,
        duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.inOut',
      });
      if (!this.isMystery) {
        this.pieceLetter = this.add.text(piecePos.x, piecePos.y, this.pieceKey, {
          fontSize: '20px', color: '#1a3d2a', fontStyle: 'bold',
        }).setOrigin(0.5).setDepth(9);
        this.tweens.add({
          targets: this.pieceLetter, y: piecePos.y - 8,
          duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.inOut',
        });
      }
      this.physics.add.overlap(this.player, this.worldPiece, this.collectPiece, null, this);
    }

    if (doorPos) {
      this.door = this.physics.add.staticSprite(doorPos.x, doorPos.y - 8, 'portal');
      this.door.setScale(0.09).setAlpha(this.pieceGot ? 1 : 0.35);
      this.door.refreshBody();
      this.door.body.setSize(this.door.displayWidth * 0.4, this.door.displayHeight * 0.6);
      this.doorActive = !!this.pieceGot;
      if (this.doorActive) {
        this.tweens.add({ targets: this.door, scale: this.door.scale * 1.12, duration: 500, yoyo: true, repeat: -1 });
      }
      this.physics.add.overlap(this.player, this.door, () => {
        if (this.doorActive) this.finishLevel();
      });
    }

    this.buildHud();

    this.cameras.main.startFollow(this.player, true, 0.12, 0.08);
    this.cameras.main.setDeadzone(this.level.type === 'scene' ? 48 : 120, 72);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.jumpKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.lastGroundedAt = 0;
    this.jumpQueuedAt = -1;
    this.airJumps = 0;
    this.demoWalk = new URLSearchParams(location.search).get('walk') === '1';
  }

  createPaintedScene() {
    const { w, h } = this.level.size;
    this.heroScale = 0.2;
    this.jumpVel = -620;
    this.physics.world.setBounds(0, 0, w, h + 200);
    this.physics.world.checkCollision.down = false;
    this.cameras.main.setBounds(0, 0, w, h);

    this.add.image(0, 0, this.level.bg)
      .setOrigin(0, 0)
      .setDisplaySize(w, h)
      .setScrollFactor(1)
      .setDepth(-10);

    (this.level.platforms || []).forEach((p) => {
      const box = this.add.rectangle(p.x, p.y, p.w + 8, p.h + 10, 0x00ff00, 0);
      this.platforms.add(box);
    });

    this.addWeather(w, h);
    this.addForestLife(w, h);

    return {
      spawn: this.level.spawn,
      piece: this.level.piece,
      door: this.level.door,
    };
  }

  createTileScene() {
    const rows = this.level.map;
    const cols = rows[0].length;
    const worldW = Math.max(this.scale.width, cols * TILE);
    const worldH = this.scale.height;
    this.heroScale = HERO_SCALE;
    this.jumpVel = JUMP_VEL;
    this.physics.world.setBounds(0, 0, worldW, worldH);
    this.cameras.main.setBounds(0, 0, worldW, worldH);
    this.addForestWorld(worldW, worldH);

    const startY = worldH - rows.length * TILE;
    let spawn = { x: TILE, y: startY };
    let door = null;
    let piece = null;
    rows.forEach((row, r) => {
      [...row].forEach((ch, c) => {
        const x = c * TILE + TILE / 2;
        const y = startY + r * TILE + TILE / 2;
        if (ch === '#') this.addSolid(x, y, rows[r + 1] && rows[r + 1][c]);
        if (ch === 'S') spawn = { x, y };
        if (ch === 'D') door = { x, y };
        if (ch === 'P') piece = { x, y };
        if (ch === 'H') {
          const flower = this.hearts.create(x, y, 'glow-flower');
          flower.setScale(0.08).refreshBody();
        }
      });
    });
    return { spawn, piece, door };
  }

  addSolid(x, y, below) {
    const t = this.platforms.create(x, y, 'tile-hit');
    t.refreshBody();
    t.setVisible(false);
    this.add.image(x, y, 'tile-moss').setDisplaySize(TILE + 10, TILE + 8).setDepth(1);
    if (below !== '#' && Math.random() < 0.18) {
      const vine = this.add.image(x + Phaser.Math.Between(-6, 6), y + TILE / 2 - 4, 'vine')
        .setOrigin(0.5, 0).setScale(0.07).setDepth(4).setAlpha(0.75);
      this.tweens.add({
        targets: vine, angle: Phaser.Math.Between(-6, 6),
        duration: 2400 + Math.random() * 800, yoyo: true, repeat: -1, ease: 'Sine.inOut',
      });
    }
  }

  buildHud() {
    const collected = this.registry.get('pieces') || [];
    const mystery = this.registry.get('mysteryLevels') || [];
    const deal = this.registry.get('pieceDeal');
    this.hudSlots = [];
    this.hudLetters = [];
    const startX = 36;
    for (let i = 0; i < 7; i++) {
      const x = startX + i * 46;
      let tex = 'crystal-empty';
      if (collected[i]) tex = mystery.indexOf(i) !== -1 ? 'crystal-mystery' : 'crystal-shard';
      const slot = this.add.image(x, 28, tex)
        .setScale(collected[i] ? 0.045 : 0.038).setScrollFactor(0).setDepth(40)
        .setAlpha(collected[i] ? 1 : 0.45);
      if (collected[i] && mystery.indexOf(i) === -1) slot.setTint(CRYSTAL_TINT[deal[i]] || 0xffffff);
      this.hudSlots.push(slot);
      const letter = this.add.text(x, 28, collected[i] && mystery.indexOf(i) === -1 ? deal[i] : '', {
        fontSize: '15px', color: '#1a3d2a', fontStyle: 'bold',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(41);
      this.hudLetters.push(letter);
    }
    this.add.text(startX + 7 * 46 + 8, 28, `${this.levelIndex + 1}/7`, {
      fontSize: '16px', color: '#f7ead0',
    }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(40);
  }

  addWeather(worldW, worldH) {
    const kind = (this.level.theme && this.level.theme.weather) || 'firefly';
    const common = { lifespan: 4200, blendMode: 'ADD' };
    if (kind === 'snow') {
      this.add.particles(0, 0, 'dot', {
        x: { min: 0, max: worldW }, y: { min: -20, max: 40 },
        lifespan: 5000, speedY: { min: 30, max: 70 }, speedX: { min: -20, max: 12 },
        scale: { start: 1.4, end: 0.2 }, alpha: { start: 0.9, end: 0.15 },
        tint: [0xffffff, 0xe8f4ff], frequency: 50, blendMode: 'ADD',
      }).setDepth(16);
      return;
    }
    if (kind === 'petals') {
      this.add.particles(0, 0, 'dot', {
        x: { min: 0, max: worldW }, y: { min: 20, max: 180 },
        lifespan: 3800, speedY: { min: 16, max: 40 }, speedX: { min: -30, max: 20 },
        scale: { start: 1.8, end: 0.2 }, alpha: { start: 0.85, end: 0 },
        tint: [0xffb3c9, 0xffe08a, 0xff8eb0], frequency: 90, blendMode: 'ADD',
      }).setDepth(16);
      return;
    }
    if (kind === 'aurora') {
      this.add.particles(0, 0, 'dot', {
        x: { min: 0, max: worldW }, y: { min: 20, max: 220 },
        lifespan: 5000, speedY: { min: -10, max: 8 }, speedX: { min: -16, max: 16 },
        scale: { start: 2.2, end: 0.2 }, alpha: { start: 0.7, end: 0 },
        tint: [0x7eecc0, 0xc9a6ff, 0x7ecbff], frequency: 70, blendMode: 'ADD',
      }).setDepth(16);
      return;
    }
    if (kind === 'dust') {
      this.add.particles(0, 0, 'dot', {
        x: { min: 0, max: worldW }, y: { min: 80, max: worldH - 60 },
        lifespan: 3600, speedX: { min: 20, max: 50 }, speedY: { min: -8, max: 8 },
        scale: { start: 1.3, end: 0.1 }, alpha: { start: 0.35, end: 0 },
        tint: [0xffb56a, 0xffe08a], frequency: 80, blendMode: 'ADD',
      }).setDepth(16);
      return;
    }
    if (kind === 'spray') {
      this.add.particles(0, 0, 'dot', {
        x: { min: 0, max: worldW }, y: { min: worldH - 180, max: worldH - 40 },
        lifespan: 1600, speedY: { min: -70, max: -20 }, speedX: { min: -12, max: 24 },
        scale: { start: 1.6, end: 0.1 }, alpha: { start: 0.55, end: 0 },
        tint: [0xffffff, 0xd8f4ff], frequency: 40, blendMode: 'ADD',
      }).setDepth(16);
      return;
    }
    if (kind === 'lamps') {
      this.add.particles(0, 0, 'dot', {
        x: { min: 40, max: worldW - 40 }, y: { min: 80, max: worldH - 120 },
        lifespan: 3800, speed: { min: 4, max: 12 },
        scale: { start: 2.0, end: 0.2 }, alpha: { start: 0.7, end: 0 },
        tint: [0xffe08a, 0xffb56a, 0xfff4c2], frequency: 160, blendMode: 'ADD',
      }).setDepth(16);
      return;
    }
    this.add.particles(0, 0, 'dot', {
      x: { min: 40, max: worldW - 40 }, y: { min: 40, max: worldH - 80 },
      lifespan: 4200, speed: { min: 6, max: 18 },
      scale: { start: 1.4, end: 0.12 }, alpha: { start: 0.85, end: 0 },
      tint: [0xfff4c2, 0xc8ffd4, 0xffe08a], frequency: 220, blendMode: 'ADD',
    }).setDepth(12);
  }

  addForestLife(worldW, worldH) {
    const theme = this.level.theme || {};
    const critter = theme.critter || 'rabbit';
    const pick = theme.pick || 'fruit-berry';
    const flyer = theme.flyer || 'bird';
    this.rabbits = [];
    (this.level.rabbits || []).forEach((p, i) => {
      const scales = { deer: 0.11, crab: 0.08, lizard: 0.075, cat: 0.08, 'snow-hare': 0.08 };
      const r = this.add.image(p.x, p.y, critter)
        .setScale(scales[critter] || 0.075).setOrigin(0.5, 1).setDepth(9);
      if (i % 2) r.setFlipX(true);
      this.tweens.add({
        targets: r, y: p.y - 4,
        duration: 700 + i * 180, yoyo: true, repeat: -1, ease: 'Sine.inOut',
      });
      this.rabbits.push({ spr: r, fleeing: false, shy: critter !== 'deer' });
    });

    (this.level.fruits || []).forEach((p) => {
      const glow = this.add.circle(p.x, p.y, 22, 0xfff4c2, 0.28).setDepth(7);
      const fruit = this.hearts.create(p.x, p.y, pick);
      const pickScale = { lantern: 0.1, 'cactus-bloom': 0.07, wildflower: 0.14, shell: 0.075, 'ice-bloom': 0.09 };
      fruit.setScale(pickScale[pick] || 0.08).setDepth(8).refreshBody();
      this.tweens.add({
        targets: [fruit, glow], y: p.y - 6,
        duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.inOut',
      });
      this.tweens.add({
        targets: fruit, angle: 8,
        duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.inOut',
      });
    });

    for (let i = 0; i < 4; i++) {
      const bird = this.add.image(80 + i * (worldW / 4), 64 + (i % 3) * 30, flyer)
        .setScale(0.045).setDepth(6).setAlpha(0.92)
        .setScrollFactor(0.45 + (i % 2) * 0.12);
      this.tweens.add({
        targets: bird,
        x: bird.x + Math.min(420, worldW * 0.3),
        y: bird.y + (i % 2 ? 28 : -22),
        duration: 7000 + i * 900,
        yoyo: true, repeat: -1, ease: 'Sine.inOut',
      });
    }
  }

  updateRabbits() {
    if (!this.rabbits || !this.player) return;
    this.rabbits.forEach((r) => {
      if (r.fleeing || !r.spr.active) return;
      const dx = this.player.x - r.spr.x;
      const dy = this.player.y - r.spr.y;
      if (dx * dx + dy * dy > (r.shy === false ? 200 * 200 : 150 * 150)) return;
      r.fleeing = true;
      const dir = dx >= 0 ? -1 : 1;
      r.spr.setFlipX(dir < 0);
      this.tweens.killTweensOf(r.spr);
      this.tweens.add({
        targets: r.spr,
        x: r.spr.x + dir * 260,
        y: r.spr.y - 18,
        alpha: 0,
        duration: 720,
        ease: 'Cubic.easeIn',
        onComplete: () => r.spr.destroy(),
      });
    });
  }

  addForestWorld(worldW, worldH) {
    const bg = this.add.image(0, 0, 'bg-forest')
      .setOrigin(0, 0).setScrollFactor(0.08).setDepth(-40);
    bg.setDisplaySize(Math.max(worldW * 1.2, this.scale.width), worldH);

    const vineCount = Math.max(4, Math.floor(worldW / 180));
    for (let i = 0; i < vineCount; i++) {
      const v = this.add.image(40 + i * (worldW / vineCount), -8, 'vine')
        .setOrigin(0.5, 0).setScale(0.16 + (i % 3) * 0.03)
        .setAlpha(0.88).setDepth(18).setScrollFactor(0.7);
      if (i % 2) v.setFlipX(true);
      this.tweens.add({
        targets: v, angle: i % 2 ? 6 : -6,
        duration: 2600 + i * 180, yoyo: true, repeat: -1, ease: 'Sine.inOut',
      });
    }

    this.add.particles(0, 0, 'dot', {
      x: { min: 0, max: worldW },
      y: { min: 40, max: worldH - 80 },
      lifespan: 4200,
      speed: { min: 6, max: 20 },
      scale: { start: 1.5, end: 0.15 },
      alpha: { start: 0.9, end: 0 },
      tint: [0xfff4c2, 0xc8ffd4, 0xffe08a],
      frequency: 180,
      blendMode: 'ADD',
    }).setDepth(12);
  }

  update() {
    const now = this.time.now;
    const body = this.player.body;
    const onGround = body.blocked.down || body.touching.down;
    if (onGround) {
      this.lastGroundedAt = now;
      this.airJumps = 0;
    }

    const T = window.TOUCH || {};
    let vx = 0;
    if (this.cursors.left.isDown || T.left) vx = -MOVE_SPEED;
    else if (this.cursors.right.isDown || T.right || this.demoWalk) vx = MOVE_SPEED;
    this.player.setVelocityX(vx);

    if (Phaser.Input.Keyboard.JustDown(this.cursors.up) || Phaser.Input.Keyboard.JustDown(this.jumpKey)) {
      this.jumpQueuedAt = now;
    }
    if (T.jump) {
      T.jump = false;
      this.jumpQueuedAt = now;
    }

    const canCoyote = now - this.lastGroundedAt < COYOTE_MS;
    const buffered = this.jumpQueuedAt > 0 && now - this.jumpQueuedAt < JUMP_BUFFER_MS;
    const canDouble = this.level.type === 'scene' && !onGround && this.airJumps < 1;
    if (buffered && (onGround || canCoyote || canDouble)) {
      if (!onGround && !canCoyote) this.airJumps += 1;
      this.player.setVelocityY(this.jumpVel);
      this.jumpQueuedAt = -1;
    }

    if (vx > 0) this.player.setFlipX(false);
    else if (vx < 0) this.player.setFlipX(true);

    this.player.setScale(this.heroScale);
    if (!onGround) this.playHero(this.player.body.velocity.y < 0 ? 'hero-jump' : 'hero-fall');
    else if (vx !== 0) this.playHero('hero-run');
    else this.playHero('hero-idle');

    if (this.player.y > this.scale.height + 40) this.rescueToBranch();
    this.updateRabbits();
  }

  rescueToBranch() {
    const x = this.player.x;
    const plats = this.level.platforms || [];
    let spot = this.spawnPoint;
    if (plats.length) {
      const near = plats.reduce((best, p) => (
        !best || Math.abs(p.x - x) < Math.abs(best.x - x) ? p : best
      ), null);
      spot = { x: near.x, y: near.y - near.h / 2 - 52 };
    }
    this.player.setPosition(spot.x, spot.y);
    this.player.setVelocity(0, 0);
    this.airJumps = 0;
  }

  playHero(key) {
    if (this.player.anims.currentAnim?.key !== key) this.player.play(key);
  }

  collectHeart(player, heart) {
    heart.destroy();
    this.burst(heart.x, heart.y, 0xffe08a);
  }

  collectPiece(player, piece) {
    if (this.pieceGot) return;
    this.pieceGot = true;
    this.tweens.killTweensOf(piece);
    if (this.pieceLetter) {
      this.tweens.killTweensOf(this.pieceLetter);
      this.pieceLetter.destroy();
      this.pieceLetter = null;
    }
    piece.disableBody(true, false);
    this.burst(piece.x, piece.y, 0xe8c97a);

    const slot = this.hudSlots[this.levelIndex];
    const cam = this.cameras.main;
    this.tweens.add({
      targets: piece,
      x: cam.scrollX + slot.x,
      y: cam.scrollY + slot.y,
      scale: 0.16,
      angle: 0,
      duration: 700,
      ease: 'Cubic.easeIn',
      onComplete: () => {
        piece.destroy();
        const tex = this.isMystery ? 'crystal-mystery' : 'crystal-shard';
        slot.setTexture(tex).setScale(0.045).setAlpha(1);
        if (!this.isMystery) {
          slot.setTint(CRYSTAL_TINT[this.pieceKey] || 0xffffff);
          this.hudLetters[this.levelIndex].setText(this.pieceKey);
        }
      },
    });

    this.openDoor();
  }

  openDoor() {
    if (!this.door || this.doorActive) return;
    this.doorActive = true;
    this.door.setAlpha(1);
    this.tweens.add({ targets: this.door, scale: this.door.scale * 1.12, duration: 500, yoyo: true, repeat: -1 });
  }

  burst(x, y, color) {
    const emitter = this.add.particles(x, y, 'dot', {
      speed: { min: 60, max: 180 }, lifespan: 600, quantity: 16,
      scale: { start: 1.8, end: 0 }, tint: color, blendMode: 'ADD',
    });
    this.time.delayedCall(700, () => emitter.destroy());
  }

  finishLevel() {
    const pieces = this.registry.get('pieces') || [];
    pieces[this.levelIndex] = this.pieceKey;
    this.registry.set('pieces', pieces);

    this.burst(this.player.x, this.player.y, this.level.color);
    this.cameras.main.fadeOut(600, FADE.r, FADE.g, FADE.b);
    this.time.delayedCall(650, () => {
      if (this.levelIndex + 1 < LEVELS.length) {
        this.scene.start('Level', { level: this.levelIndex + 1 });
      } else {
        this.scene.start('Reveal');
      }
    });
  }
}
