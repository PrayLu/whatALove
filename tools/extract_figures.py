#!/usr/bin/env python3
"""从 figure.png 提取男孩/女孩：找中间空隙分割 -> floodfill 去白底 -> trim -> 缩放"""
import collections
import os
from PIL import Image

SRC = 'figure.png'
OUT_DIR = 'assets'
TARGET_H = 512          # 输出高度（游戏内再缩到 ~64px 显示，保留高清余量）
WHITE = 240             # 判定为背景的亮度阈值


def find_gap(gray):
    """在中间 1/3 区域找一列全白（两人之间的空隙）"""
    w, h = gray.size
    best_x, best_score = w // 2, -1
    for x in range(w // 3, 2 * w // 3):
        score = sum(1 for y in range(0, h, 8) if gray.getpixel((x, y)) > WHITE)
        if score > best_score:
            best_score, best_x = score, x
    return best_x


def remove_bg(img):
    """从四边 floodfill，只把与边缘连通的白色背景变透明（衣服上的白色不受影响）"""
    img = img.convert('RGBA')
    w, h = img.size
    px = img.load()
    seen = bytearray(w * h)
    q = collections.deque()
    for x in range(w):
        q.append((x, 0)); q.append((x, h - 1))
    for y in range(h):
        q.append((0, y)); q.append((w - 1, y))
    while q:
        x, y = q.popleft()
        if x < 0 or y < 0 or x >= w or y >= h:
            continue
        i = y * w + x
        if seen[i]:
            continue
        seen[i] = 1
        r, g, b, a = px[x, y]
        if r >= WHITE and g >= WHITE and b >= WHITE:
            px[x, y] = (r, g, b, 0)
            q.extend(((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)))
    return img


def process(box, out_name):
    img = Image.open(SRC).convert('RGBA').crop(box)
    img = remove_bg(img)
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
    ratio = TARGET_H / img.height
    img = img.resize((round(img.width * ratio), TARGET_H), Image.LANCZOS)
    img.save(os.path.join(OUT_DIR, out_name))
    print(f'{out_name}: {img.width}x{img.height}')


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    src = Image.open(SRC)
    w, h = src.size
    gap = find_gap(src.convert('L'))
    print(f'split at x={gap} (image {w}x{h})')
    process((0, 0, gap, h), 'boy.png')
    process((gap, 0, w, h), 'girl.png')


if __name__ == '__main__':
    main()
