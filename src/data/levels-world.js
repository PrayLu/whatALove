/* 第 2–7 关：海滩 / 沙漠 / 雪原 / 花海 / 山城 / 极光
 * y 取碰撞盒中心；ridge/strip 传入的是地面顶边。
 */
function ridge(points, w, h) {
  return points.map(([x, top]) => ({ x, y: top + h / 2, w, h }));
}
function strip(top, h) {
  return [{ x: 800, y: top + h / 2, w: 1600, h }];
}

const LEVEL2_PLATFORMS = [
  ...ridge([[40, 518], [90, 520], [140, 522], [200, 524], [260, 526], [320, 518], [380, 490]], 70, 28),
  ...ridge([[440, 430], [500, 400], [560, 394]], 70, 28),
  { x: 1080, y: 407, w: 1100, h: 30 },
];
const LEVEL2_SPAWN = { x: 150, y: 470 };
const LEVEL2_PIECE = { x: 820, y: 350 };
const LEVEL2_DOOR  = { x: 1420, y: 350 };
const LEVEL2_SIZE  = { w: 1600, h: 640 };
const LEVEL2_FRUITS = [
  { x: 360, y: 470 },
  { x: 700, y: 354 },
  { x: 1180, y: 354 },
];
const LEVEL2_RABBITS = [
  { x: 520, y: 392 },
  { x: 1080, y: 392 },
];

const LEVEL3_PLATFORMS = strip(474, 34);
const LEVEL3_SPAWN = { x: 150, y: 420 };
const LEVEL3_PIECE = { x: 820, y: 428 };
const LEVEL3_DOOR  = { x: 1420, y: 428 };
const LEVEL3_SIZE  = { w: 1600, h: 640 };
const LEVEL3_FRUITS = [
  { x: 380, y: 436 },
  { x: 900, y: 436 },
  { x: 1200, y: 436 },
];
const LEVEL3_RABBITS = [
  { x: 520, y: 474 },
  { x: 1100, y: 474 },
];

const LEVEL4_PLATFORMS = ridge([
  [40, 418], [100, 412], [160, 408], [220, 402], [270, 398], [330, 378], [400, 362],
  [480, 352], [560, 348], [650, 344], [740, 340],
  [840, 342], [940, 346], [1040, 350], [1140, 354],
  [1240, 362], [1340, 370], [1440, 378], [1520, 386], [1580, 392],
], 130, 32);
const LEVEL4_SPAWN = { x: 250, y: 350 };
const LEVEL4_PIECE = { x: 820, y: 298 };
const LEVEL4_DOOR  = { x: 1400, y: 336 };
const LEVEL4_SIZE  = { w: 1600, h: 640 };
const LEVEL4_FRUITS = [
  { x: 400, y: 324 },
  { x: 980, y: 308 },
  { x: 1240, y: 324 },
];
const LEVEL4_RABBITS = [
  { x: 560, y: 348 },
  { x: 1100, y: 354 },
];

const LEVEL5_PLATFORMS = strip(430, 32);
const LEVEL5_SPAWN = { x: 150, y: 380 };
const LEVEL5_PIECE = { x: 820, y: 392 };
const LEVEL5_DOOR  = { x: 1420, y: 430 };
const LEVEL5_SIZE  = { w: 1600, h: 640 };
const LEVEL5_FRUITS = [
  { x: 340, y: 368 },
  { x: 700, y: 368 },
  { x: 1180, y: 368 },
];
const LEVEL5_RABBITS = [
  { x: 500, y: 430 },
  { x: 1100, y: 430 },
];

const LEVEL6_PLATFORMS = strip(468, 32);
const LEVEL6_SPAWN = { x: 150, y: 416 };
const LEVEL6_PIECE = { x: 820, y: 424 };
const LEVEL6_DOOR  = { x: 1420, y: 468 };
const LEVEL6_SIZE  = { w: 1600, h: 640 };
const LEVEL6_FRUITS = [
  { x: 360, y: 430 },
  { x: 900, y: 430 },
  { x: 1200, y: 430 },
];
const LEVEL6_RABBITS = [
  { x: 520, y: 468 },
  { x: 1100, y: 468 },
];

const LEVEL7_PLATFORMS = strip(348, 32);
const LEVEL7_SPAWN = { x: 160, y: 296 };
const LEVEL7_PIECE = { x: 820, y: 304 };
const LEVEL7_DOOR  = { x: 1400, y: 348 };
const LEVEL7_SIZE  = { w: 1600, h: 640 };
const LEVEL7_FRUITS = [
  { x: 380, y: 310 },
  { x: 980, y: 310 },
  { x: 1220, y: 310 },
];
const LEVEL7_RABBITS = [
  { x: 520, y: 348 },
  { x: 1100, y: 348 },
];
