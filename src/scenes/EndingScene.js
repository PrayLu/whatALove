/* ============================================================
 *  终章 · 睡美人：林间花床上，男孩走来唤醒女孩
 * ============================================================ */
class EndingScene extends Phaser.Scene {
  constructor() { super('Ending'); }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor('#10261c');
    this.cameras.main.fadeIn(800, 12, 38, 30);

    this.add.image(width / 2, height / 2, 'bg-ending').setDisplaySize(width, height);

    [-20, width * 0.5, width + 10].forEach((x, i) => {
      const v = this.add.image(x, -12, 'vine').setOrigin(0.5, 0).setScale(0.2 + (i % 2) * 0.04).setAlpha(0.9);
      if (i === 1) v.setFlipX(true);
      this.tweens.add({
        targets: v, angle: i % 2 ? 5 : -5,
        duration: 2800 + i * 250, yoyo: true, repeat: -1, ease: 'Sine.inOut',
      });
    });

    this.add.particles(0, 0, 'dot', {
      x: { min: 30, max: width - 30 },
      y: { min: 30, max: height - 140 },
      lifespan: 4000, speed: { min: 6, max: 18 },
      scale: { start: 1.6, end: 0.2 }, alpha: { start: 0.9, end: 0 },
      tint: [0xfff4c2, 0xc8ffd4, 0xffe08a],
      frequency: 150, blendMode: 'ADD',
    });

    const groundY = height - 108;
    const bedX = width * 0.62;

    this.add.image(bedX, groundY + 18, 'flower-bed').setOrigin(0.5, 1).setScale(0.42);
    this.add.image(bedX - 190, groundY + 12, 'foliage').setOrigin(0.5, 1).setScale(0.16).setAlpha(0.8);
    this.add.image(bedX + 210, groundY + 12, 'foliage').setOrigin(0.5, 1).setScale(0.17).setFlipX(true).setAlpha(0.8);

    const sleepGirl = this.add.image(bedX + 8, groundY + 6, 'sleep-girl')
      .setOrigin(0.5, 1).setScale(0.48).setDepth(6);

    const boy = this.add.sprite(88, groundY + 6, 'boy-walk', 0)
      .setOrigin(0.5, 1).setScale(0.36).setDepth(7);
    boy.play('boy-carry-walk');

    this.time.delayedCall(400, () => {
      this.tweens.add({
        targets: boy, x: bedX - 168, duration: 2800, ease: 'Linear',
        onComplete: () => {
          boy.play('boy-carry-idle');
          boy.y = groundY + 6;
        },
      });
    });

    this.time.delayedCall(3500, () => {
      const heart = this.add.image(bedX - 90, groundY - 90, 'glow-flower').setScale(0).setDepth(8);
      this.tweens.add({
        targets: heart, scale: 0.16, y: groundY - 170,
        duration: 900, ease: 'Back.easeOut',
      });
    });

    this.time.delayedCall(4400, () => {
      this.tweens.add({
        targets: sleepGirl, alpha: 0, duration: 280,
        onComplete: () => sleepGirl.destroy(),
      });
      const girl = this.add.image(bedX + 8, groundY - 40, 'girl-happy')
        .setOrigin(0.5, 1).setScale(0.34).setAlpha(0).setDepth(6);
      this.tweens.add({
        targets: girl, alpha: 1, y: groundY + 6, duration: 600, ease: 'Bounce.easeOut',
        onComplete: () => {
          this.tweens.add({
            targets: girl, y: groundY - 6,
            duration: 700, yoyo: true, repeat: -1, ease: 'Sine.inOut',
          });
        },
      });

      const blush = this.add.text(bedX + 55, groundY - 160, '♡', {
        fontSize: '38px', color: '#ffb3c9',
      }).setOrigin(0.5).setAlpha(0).setDepth(8);
      this.tweens.add({ targets: blush, alpha: 1, y: blush.y - 16, duration: 700 });
    });

    const skipLetter = new URLSearchParams(location.search).has('letter');
    if (skipLetter) this.showConfession();
    else this.time.delayedCall(5400, () => this.showConfession());
    this.preloadHappyVideo();
  }

  preloadHappyVideo() {
    const video = document.getElementById('ending-video');
    if (!video || video.dataset.ready) return;
    video.dataset.ready = '1';
    video.setAttribute('playsinline', 'true');
    video.setAttribute('webkit-playsinline', 'true');
    video.playsInline = true;
    video.preload = 'metadata';
    video.src = (window.ASSET_BASE || '') + 'assets/happyending.mp4?v=5';
  }

  playHappyVideo() {
    window.ENDING_VIDEO = true;
    const bgm = this.sound.get('bgm');
    if (bgm) {
      bgm.pause();
      bgm.setVolume(0);
    }

    const wrap = document.getElementById('ending-video-wrap');
    const video = document.getElementById('ending-video');
    const close = document.getElementById('ending-video-close');
    const playBtn = document.getElementById('ending-video-play');
    if (!wrap || !video) return;

    video.setAttribute('playsinline', 'true');
    video.setAttribute('webkit-playsinline', 'true');
    video.playsInline = true;
    video.loop = true;
    if (!video.getAttribute('src')) {
      video.src = (window.ASSET_BASE || '') + 'assets/happyending.mp4?v=5';
    }
    wrap.classList.remove('need-tap');
    wrap.classList.add('show');
    document.body.classList.add('ending-video-open');
    document.getElementById('ending-choice')?.classList.remove('show');
    try { video.currentTime = 0; } catch (e) {}
    video.muted = false;

    const start = () => {
      wrap.classList.remove('need-tap');
      video.muted = false;
      const p = video.play();
      if (p && p.catch) {
        p.catch(() => {
          wrap.classList.add('need-tap');
        });
      }
    };
    start();

    if (playBtn && !playBtn.dataset.bound) {
      playBtn.dataset.bound = '1';
      playBtn.addEventListener('click', (e) => { e.stopPropagation(); start(); });
    }
    if (close && !close.dataset.bound) {
      close.dataset.bound = '1';
      close.addEventListener('click', () => this.closeHappyVideo());
    }
  }

  closeHappyVideo() {
    const wrap = document.getElementById('ending-video-wrap');
    const video = document.getElementById('ending-video');
    if (video) {
      video.pause();
      video.currentTime = 0;
    }
    wrap?.classList.remove('show');
    wrap?.classList.remove('need-tap');
    document.body.classList.remove('ending-video-open');
    document.getElementById('ending-choice')?.classList.add('show');
    window.ENDING_VIDEO = false;
    this.letterBusy = false;

    if (this.letter?.panel) {
      this.letter.panel.setAlpha(1);
      [this.letter.lead, this.letter.wish, this.letter.places, this.letter.question, this.letter.maybe]
        .concat(this.letter.buttons || [])
        .forEach((el) => el && el.setAlpha(1));
      this.letter.maybe?.setInteractive({ useHandCursor: true });
      (this.letter.buttons || []).forEach((b) => {
        b.iterate?.((child) => {
          if (child.type === 'Zone' || child.input) child.setInteractive({ useHandCursor: true });
        });
      });
    }

    const bgm = this.sound.get('bgm');
    if (bgm) bgm.setVolume(0.42);
    if (typeof window.applyMusicToggle === 'function') window.applyMusicToggle();
  }

  showConfession() {
    const { width } = this.scale;
    const panelW = 600;
    const panelH = 292;
    const cx = width / 2;
    const cy = 176;

    const panel = this.add.container(cx, cy).setDepth(20).setAlpha(0);
    const g = this.add.graphics();
    g.fillStyle(0x0c1f18, 0.82);
    g.fillRoundedRect(-panelW / 2, -panelH / 2, panelW, panelH, 24);
    g.lineStyle(2, 0xe8c97a, 0.5);
    g.strokeRoundedRect(-panelW / 2, -panelH / 2, panelW, panelH, 24);
    g.lineStyle(1, 0xf7ead0, 0.16);
    g.strokeRoundedRect(-panelW / 2 + 8, -panelH / 2 + 8, panelW - 16, panelH - 16, 18);
    panel.add(g);

    const flower = this.add.image(0, -panelH / 2 + 6, 'glow-flower').setScale(0.065).setAlpha(0.95);
    panel.add(flower);

    const font = '"PingFang SC", "Hiragino Sans GB", "Noto Sans SC", sans-serif';
    const name = this.add.text(0, -104, `${DIALOGUES.name}，`, {
      fontFamily: font, fontSize: '15px', color: '#c9e6c0',
    }).setOrigin(0.5);
    panel.add(name);

    const lead = this.add.text(0, -68, '', {
      fontFamily: font, fontSize: '30px', color: '#f7ead0',
      shadow: { offsetX: 0, offsetY: 2, color: '#06140f', blur: 8, fill: true },
    }).setOrigin(0.5);
    panel.add(lead);

    const wish = this.add.text(0, -24, DIALOGUES.confessionWish, {
      fontFamily: font, fontSize: '16px', color: '#d5efc8',
    }).setOrigin(0.5).setAlpha(0);
    panel.add(wish);

    const places = this.add.text(0, 10, DIALOGUES.places, {
      fontFamily: font, fontSize: '15px', color: '#e8c97a',
    }).setOrigin(0.5).setAlpha(0);
    panel.add(places);

    const question = this.add.text(0, 42, DIALOGUES.question, {
      fontFamily: font, fontSize: '17px', color: '#f7ead0',
    }).setOrigin(0.5).setAlpha(0);
    panel.add(question);

    const maybe = this.add.text(panelW / 2 - 18, -panelH / 2 + 18, DIALOGUES.no, {
      fontFamily: font, fontSize: '13px', color: '#b7cec0',
    }).setOrigin(1, 0.5).setInteractive({ useHandCursor: true }).setAlpha(0);
    maybe.on('pointerover', () => maybe.setColor('#f7ead0'));
    maybe.on('pointerout', () => maybe.setColor('#b7cec0'));
    maybe.on('pointerdown', () => this.respond(DIALOGUES.noResult, false));
    maybe.setPadding(12, 10, 4, 10);
    panel.add(maybe);

    this.letter = { panel, lead, wish, places, question, maybe, buttons: [] };
    window.endingYes = () => this.respond(DIALOGUES.yesResult, true);
    const choice = document.getElementById('ending-choice');
    if (choice && !choice.dataset.bound) {
      choice.dataset.bound = '1';
      document.getElementById('ending-yes-go')?.addEventListener('click', () => window.endingYes && window.endingYes());
      document.getElementById('ending-yes-ok')?.addEventListener('click', () => window.endingYes && window.endingYes());
    }
    panel.y = cy - 8;
    this.tweens.add({ targets: panel, alpha: 1, y: cy + 6, duration: 520, ease: 'Cubic.easeOut' });

    const full = DIALOGUES.confession;
    const instant = new URLSearchParams(location.search).has('letter');
    if (instant) {
      panel.setAlpha(1).y = cy;
      lead.setText(full);
      wish.setAlpha(1);
      places.setAlpha(1);
      question.setAlpha(1);
      maybe.setAlpha(1);
      this.showButtons();
      return;
    }
    let i = 0;
    this.time.addEvent({
      delay: 110,
      repeat: Math.max(full.length - 1, 0),
      callback: () => {
        lead.setText(full.slice(0, ++i));
        if (i < full.length) return;
        this.tweens.add({
          targets: [wish, places, question, maybe],
          alpha: 1, duration: 500, delay: 180,
        });
        this.time.delayedCall(520, () => this.showButtons());
      },
    });
  }

  showButtons() {
    const go = this.makeLetterButton(-118, 100, DIALOGUES.yes, true, () => {
      this.respond(DIALOGUES.yesResult, true);
    });
    const yes = this.makeLetterButton(118, 100, DIALOGUES.yesAlt, true, () => {
      this.respond(DIALOGUES.yesResult, true);
    });
    this.letter.buttons = [go, yes];
    this.letter.panel.add([go, yes]);
    document.getElementById('ending-choice')?.classList.add('show');
    if (new URLSearchParams(location.search).has('letter')) {
      go.setAlpha(1);
      yes.setAlpha(1);
      return;
    }
    this.tweens.add({ targets: [go, yes], alpha: 1, duration: 420 });
  }

  makeLetterButton(x, y, label, primary, onClick) {
    const w = 168;
    const h = 46;
    const g = this.add.graphics();
    const paint = (hover) => {
      g.clear();
      if (primary) {
        g.fillStyle(hover ? 0xf3dc9a : 0xe8c97a, 1);
        g.fillRoundedRect(-w / 2, -h / 2, w, h, 23);
        g.lineStyle(1.5, 0xfff4c2, 0.85);
        g.strokeRoundedRect(-w / 2, -h / 2, w, h, 23);
      } else {
        g.fillStyle(0x163326, hover ? 0.92 : 0.55);
        g.fillRoundedRect(-w / 2, -h / 2, w, h, 23);
        g.lineStyle(1.5, hover ? 0xe8c97a : 0xc9e6c0, 0.7);
        g.strokeRoundedRect(-w / 2, -h / 2, w, h, 23);
      }
    };
    paint(false);
    const font = '"PingFang SC", "Hiragino Sans GB", "Noto Sans SC", sans-serif';
    const txt = this.add.text(0, 0, label, {
      fontFamily: font, fontSize: '18px',
      color: primary ? '#1a3d2a' : '#f7ead0',
    }).setOrigin(0.5);
    const hit = this.add.zone(0, 0, w, h).setInteractive({ useHandCursor: true });
    const c = this.add.container(x, y, [g, txt, hit]).setSize(w, h).setAlpha(0);
    hit.on('pointerover', () => { paint(true); this.tweens.add({ targets: c, scale: 1.05, duration: 120 }); });
    hit.on('pointerout', () => { paint(false); this.tweens.add({ targets: c, scale: 1, duration: 120 }); });
    hit.on('pointerdown', onClick);
    return c;
  }

  respond(text, isYes) {
    if (this.letterBusy) return;
    this.letterBusy = true;
    this.letter.maybe?.disableInteractive();
    (this.letter.buttons || []).forEach((b) => {
      b.disableInteractive?.();
      b.iterate?.((child) => child.disableInteractive && child.disableInteractive());
      this.tweens.add({ targets: b, alpha: 0, duration: 220 });
    });
    this.tweens.add({
      targets: [this.letter.lead, this.letter.wish, this.letter.places, this.letter.question, this.letter.maybe],
      alpha: 0, duration: 280,
    });

    document.getElementById('ending-choice')?.classList.remove('show');

    if (isYes) {
      this.playHappyVideo();
      this.cameras.main.flash(280, 255, 244, 194);
      this.tweens.add({ targets: this.letter.panel, alpha: 0, duration: 280 });
      return;
    }

    const font = '"PingFang SC", "Hiragino Sans GB", "Noto Sans SC", sans-serif';
    const result = this.add.text(0, 8, text, {
      fontFamily: font, fontSize: '22px',
      color: '#d5efc8',
    }).setOrigin(0.5).setAlpha(0);
    this.letter.panel.add(result);
    this.tweens.add({ targets: result, alpha: 1, duration: 700, delay: 200 });
  }
}
