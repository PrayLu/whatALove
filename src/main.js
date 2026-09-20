/* 游戏入口 */
const config = {
  type: Phaser.AUTO,
  parent: 'game',
  width: 960,
  height: 640,
  backgroundColor: '#10261c',
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 1400 }, debug: false },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  input: {
    activePointers: 3,
  },
  loader: {
    imageLoadType: 'HTMLImageElement',
    maxParallelDownloads: 4,
  },
  audio: {
    disableWebAudio: !!window.IS_PHONE,
  },
  scene: [BootScene, LevelScene, RevealScene, TransformScene, EndingScene],
};

window.game = new Phaser.Game(config);
if (typeof window.applyMusicToggle === 'function') window.applyMusicToggle();
