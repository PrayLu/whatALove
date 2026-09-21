/* ============================================================
 *  可自定义文案：只有终章的文字，改这里即可
 * ============================================================ */
const DIALOGUES = {
  // 对方昵称（会出现在终章）
  name: '飞飞',

  // 标题
  title: 'What A Love',
  subtitle: '← → 移动    ↑ / 空格 跳跃    集齐七个水晶即可解锁',

  reveal: 'LOVEFEI',
  revealHint: '还有三片水晶，笼在雾里……',
  unmask: '蒙面侠其实是我',

  // 终章表白
  confession: '我喜欢你。',
  confessionWish: '希望以后能和你一起走过',
  places: '森林  ·  海滩  ·  沙漠  ·  雪原  ·  花海  ·  山城  ·  极光',
  question: '是否愿意？',
  yes: '一起去！',
  yesAlt: '答应你！',
  no: '再想想',
  yesResult: '那我们从下一站开始吧',
  noResult: '没关系，地图我先收着',
};

const LEVEL_BEATS = {
  forest: {
    pick: '带给它吧',
    wait: '它好像在等你',
    feed: '它愿意跟你走走了',
    done: '叶子后面亮起来了',
  },
  beach: {
    pick: '这片贝壳正好',
    wait: '螃蟹护着沙子',
    feed: '它把沙子刨开了',
    done: '沙里探出一颗光',
  },
  desert: {
    pick: '花好像刚开',
    wait: '它懒洋洋地晒太阳',
    feed: '它让开了一点路',
    done: '热风里出现了光',
  },
  snow: {
    pick: '冰花凉凉的',
    wait: '雪兔朝那边看',
    feed: '它蹦着给你带路',
    done: '雪地里冒出光来',
  },
  flowers: {
    pick: '摘一束带着走',
    wait: '它藏在花丛里',
    feed: '花瓣沾在它鼻子上',
    done: '花心里睡着光',
  },
  town: {
    pick: '灯笼还温着',
    wait: '猫蹲在灯下面',
    feed: '它呼噜一声',
    done: '路灯一盏盏亮了',
  },
  aurora: {
    pick: '像一小片极光',
    wait: '鹿没有跑',
    feed: '它低头碰了碰你',
    done: '光落在水晶上',
  },
};

const LOVE_WORD = 'LOVEFEI';
const ALL_PIECES = LOVE_WORD.split('');
const CRYSTAL_TINT = {
  L: 0xff8eb0,
  O: 0xffb56a,
  V: 0xc9a6ff,
  E: 0x7eecc0,
  F: 0x7ecbff,
  I: 0xf5f1e6,
};

function ensurePieceDeal(reg) {
  if (reg.get('pieceDeal')) return;
  const deal = ALL_PIECES.slice();
  for (let i = deal.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = deal[i];
    deal[i] = deal[j];
    deal[j] = tmp;
  }
  const mystery = [];
  while (mystery.length < 3) {
    const n = Math.floor(Math.random() * 7);
    if (mystery.indexOf(n) === -1) mystery.push(n);
  }
  reg.set('pieceDeal', deal);
  reg.set('mysteryLevels', mystery);
}
