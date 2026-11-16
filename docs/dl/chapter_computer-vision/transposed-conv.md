---
language: dl
chapter: 108
title: "转置卷积"
level: intermediate
minutes: 8
goals:
  - "用全 1 的核核对输出"
  - "看步长 2 的边长"
  - "再看一次双线性放大"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

转置卷积把每个输入像素用一只核涂到输出上。这里的权重形状是输入通道、输出通道、核高、核宽，和普通卷积的通道顺序不同。

### 全 1 核的中心是 4

输入是 2 乘 2 的全 1，核也是 2 乘 2 的全 1，步长 1。输出边长 3。角上是 1，中心是 4，因为中心被四个输入各加了一次。

```numpy run expect="out 3 1 4" title="全 1 核的中心是 4"
# 全 1 核的输出
import minitorch as mt
import numpy as np
np.random.seed(0)
x = mt.tensor(np.ones((1, 1, 2, 2)))
layer = mt.nn.ConvTranspose2d(1, 1, 2, stride=1, padding=0, bias=False)
layer.weight.data[:] = 1
y = layer(x)
print("out", y.shape[2], int(y.data[0, 0, 0, 0]), int(y.data[0, 0, 1, 1]))
```

### 步长 2 和双线性

同样的 2 乘 2 输入，核 2、步长 2，输出边长是 4。旁边把 0、1、2、3 排成 2 乘 2，双线性放到 4 乘 4，内点 (1, 1) 是 0.75。

```numpy run expect="stride 4 4 0.75" title="步长 2 和双线性"
# 步长和双线性
import minitorch as mt
import numpy as np
x = mt.tensor(np.ones((1, 1, 2, 2)))
layer = mt.nn.ConvTranspose2d(1, 1, 2, stride=2, bias=False)
wide = layer(x)
small = mt.tensor(np.arange(4, dtype=np.float64).reshape(1, 1, 2, 2))
up = mt.upsample_bilinear(small, (4, 4))
print("stride", wide.shape[2], wide.shape[3], round(float(up.data[0, 0, 1, 1]), 2))
```

### 通道顺序写在权重上

转置卷积的权重第一维是输入通道。不要按普通卷积的输出通道在前去填这只核，否则涂出去的通道会对错。

延伸阅读：[转置卷积](https://zh.d2l.ai/chapter_computer-vision/transposed-conv.html)，英文页在[这里](https://d2l.ai/chapter_computer-vision/transposed-conv.html)。
