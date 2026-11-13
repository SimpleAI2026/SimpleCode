---
language: dl
chapter: 28
title: "数值稳定和初始化"
level: intermediate
minutes: 8
goals:
  - "避免大指数溢出"
  - "打印稳定后的最大概率"
  - "按输入维设置初始尺度"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-13"
---

三个很大的分数如果直接做指数会溢出。先减去最大值，再归一，最大的那一项约是 0.6652。初始化则让权重的尺度跟输入维的平方根有关。

### 先减最大值

1000、1001、1002 减去 1002 之后是 -2、-1、0。指数都是普通大小的数。最后一项占三项之和的比例保留四位小数。

```numpy run expect="0.6652" title="稳定 softmax"
# 大指数先平移
import numpy as np
logits = np.array([1000.0, 1001.0, 1002.0])
shifted = logits - logits.max()
prob = np.exp(shifted)
prob = prob / prob.sum()
print(round(float(prob[-1]), 4))
```

### 按输入维缩放

四行八列的权重，标准差设成 1 除以根号 8。种子是 0。打印行数、列数，以及样本标准差的三位小数。

```numpy run expect="4 8" title="初始尺度"
# 种子 0 的初始权重
import numpy as np
rng = np.random.default_rng(0)
weight = rng.normal(0.0, 1.0 / np.sqrt(8.0), size=(4, 8))
print(weight.shape[0], weight.shape[1], round(float(weight.std()), 3))
```

### 线性层自己的初始化更窄

页面上的线性层用均匀分布，半宽是 1 除以输入维的平方根。这一节的正态例子只说明尺度从哪来，不替换那个层。

延伸阅读：[数值稳定和初始化](https://zh.d2l.ai/chapter_multilayer-perceptrons/numerical-stability-and-init.html)，英文页在[这里](https://d2l.ai/chapter_multilayer-perceptrons/numerical-stability-and-init.html)。
