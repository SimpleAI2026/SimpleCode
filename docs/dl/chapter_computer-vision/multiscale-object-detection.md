---
language: dl
chapter: 103
title: "多尺度目标检测"
level: intermediate
minutes: 8
goals:
  - "看两次池化后的边长"
  - "在 16 和 8 的格子上数锚"
  - "不在这一页训练检测头"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

同一张 32 边长的图，池化一次是 16，再池化一次是 8。粗格子适合大物体，细格子适合小物体。这一页只核对边长和锚的个数。

### 两次池化

空白输入是 1 乘 1 乘 32 乘 32。第一次池化的边是 16，第二次是 8。通道数在这里保持 1。

```numpy run expect="maps 16 8" title="两次池化"
# 特征图边长
import minitorch as mt
import numpy as np
x = mt.tensor(np.zeros((1, 1, 32, 32)))
h1 = mt.nn.MaxPool2d(2, stride=2)(x)
h2 = mt.nn.MaxPool2d(2, stride=2)(h1)
print("maps", h1.shape[2], h2.shape[2])
```

### 两层锚加在一起

16 乘 16 的格子每个点一只锚，是 256。8 乘 8 再加 64。总数 320。每种格子只用一个尺度、一种比例。

```numpy run expect="count 320" title="两层锚加在一起"
# 两层锚的个数
import minitorch as mt
import numpy as np
fine = mt.multibox_prior(16, 16, [0.2], [1.0])
coarse = mt.multibox_prior(8, 8, [0.4], [1.0])
print("count", fine.shape[0] + coarse.shape[0])
```

### 个数不等于检出

多尺度这一页没有类别卷积，也没有框的回归。320 只是候选格子的数量，不是预测出来的物体个数。

延伸阅读：[多尺度目标检测](https://zh.d2l.ai/chapter_computer-vision/multiscale-object-detection.html)，英文页在[这里](https://d2l.ai/chapter_computer-vision/multiscale-object-detection.html)。
