---
language: dl
chapter: 25
title: "权重衰减"
level: intermediate
minutes: 8
goals:
  - "比较衰减开和关"
  - "四步各打印一个损失"
  - "单独算出惩罚项"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-13"
---

同一组四个点和同一个初始权重，一个优化器不惩罚权重，另一个把衰减设为 0.4。两边都只走四步，打印两个 loss。

### 有衰减和没有衰减

衰减加在梯度上，不改已经存好的梯度数组本身。四步之后两个损失都带 loss 字样。它们不必一个比另一个小。

```numpy run expect="loss" title="两次四步"
# 衰减 0 和 0.4
import numpy as np
import minitorch as mt
def fit(decay):
    w = mt.tensor(np.array([0.8, -0.6]), requires_grad=True)
    opt = mt.optim.SGD([w], lr=0.15, weight_decay=decay)
    x = np.array([[1.0, 0.0], [0.0, 1.0], [1.0, 1.0], [1.0, -1.0]])
    y = np.array([0.2, -0.1, 0.3, 0.05])
    last = 0.0
    for _ in range(4):
        opt.zero_grad()
        pred = mt.tensor(x) @ w
        yt = mt.tensor(y)
        loss = ((pred - yt) * (pred - yt)).mean()
        loss.backward()
        opt.step()
        last = loss.item()
    return last
print("loss", round(fit(0.0), 4), round(fit(0.4), 4))
```

### 惩罚项单独看

权重 0.8、衰减 0.4 时，这一项是衰减乘权重的平方。它不是上一段的损失，只说明惩罚的尺度。

```numpy run expect="penalty 0.256" title="惩罚项"
# 0.4 乘 0.64
weight = 0.8
decay = 0.4
print("penalty", round(decay * weight * weight, 4))
```

### 暂退是另一种约束

衰减每次都把权重大小往回拉。暂退则按调用者给的掩码把一部分隐藏单元乘成 0，而且只在训练标记打开时这样做。

延伸阅读：[权重衰减](https://zh.d2l.ai/chapter_multilayer-perceptrons/weight-decay.html)，英文页在[这里](https://d2l.ai/chapter_multilayer-perceptrons/weight-decay.html)。
