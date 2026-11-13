---
language: dl
chapter: 5
title: "数据操作"
level: beginner
minutes: 8
goals:
  - "用索引读出指定格子"
  - "对整张表求和"
  - "改形状后求平均"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-13"
---

格子用张量保存。取一个位置、把全部元素加起来、改形状、再求平均，这四件事够后面的小批量使用。

### 取出一格再求和

两行三列的整数表里，第 0 行第 1 列是 2。六个格子相加是 21。索引返回的仍是张量，所以要先取出标量再打印。

```numpy run expect="2 21" title="索引与求和"
# 第 0 行第 1 列
import minitorch as mt
grid = mt.tensor([[1, 2, 3], [4, 5, 6]])
print(int(grid[0, 1].item()), int(grid.sum().item()))
```

### 拉成方阵再平均

四个数排成两行两列之后，行数和列数都是 2，平均数是 5。改形状不复制新的数值，只改后面的读取方式。

```numpy run expect="2 2 5.0" title="变形与平均"
# 四个数排成方阵
import minitorch as mt
row = mt.tensor([2.0, 4.0, 6.0, 8.0])
box = row.reshape(2, 2)
print(box.shape[0], box.shape[1], round(float(box.mean().item()), 1))
```

### 广播留在加法里

标量加到每一行时，反向会把多出来的轴加回去。这一节先把形状打印对，广播的梯度放到自动微分那一节再检查。

延伸阅读：[数据操作](https://zh.d2l.ai/chapter_preliminaries/ndarray.html)，英文页在[这里](https://d2l.ai/chapter_preliminaries/ndarray.html)。
