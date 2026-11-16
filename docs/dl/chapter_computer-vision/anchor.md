---
language: dl
chapter: 102
title: "锚框"
level: intermediate
minutes: 8
goals:
  - "算两只框的交并比"
  - "在 2 乘 2 格子上生成锚"
  - "用非极大值抑制留下两只"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

锚框是格子上预先放好的候选。交并比是相交面积除以相并面积。抑制按分数从高到低丢掉重叠太多的框。

### 交并比是七分之一

一只框占 [0, 2] 的正方形，另一只从 1 开始占到 3。相交是 1，相并是 7，比值约 0.1429。

```numpy run expect="iou 0.1429" title="交并比是七分之一"
# 两只正方形的交并比
import minitorch as mt
import numpy as np
iou = mt.box_iou([[0, 0, 2, 2]], [[1, 1, 3, 3]])
print("iou", round(float(iou[0, 0]), 4))
```

### 四个格子两种比例

高和宽都是 2，一个尺度配两种长宽比，一共 8 只锚。抑制的例子里分数 0.9 的那只先留下，下标是 1，远处的框下标是 2。

```numpy run expect="keep 8 1 2" title="四个格子两种比例"
# 锚的个数和抑制结果
import minitorch as mt
import numpy as np
anchors = mt.multibox_prior(2, 2, [0.5], [1.0, 2.0])
kept = mt.nms([[0, 0, 2, 2], [0.1, 0.1, 2.1, 2.1], [5, 5, 6, 6]], [0.2, 0.9, 0.4], 0.5)
print("keep", anchors.shape[0], int(kept[0]), int(kept[1]))
```

### 格子先保持很小

锚框页只用 2 乘 2，避免在解释交并比时铺满整张特征图。多尺度那一页才把格子放大到 16 和 8。

延伸阅读：[锚框](https://zh.d2l.ai/chapter_computer-vision/anchor.html)，英文页在[这里](https://d2l.ai/chapter_computer-vision/anchor.html)。
