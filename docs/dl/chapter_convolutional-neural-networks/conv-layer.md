---
language: dl
chapter: 40
title: "互相关"
level: beginner
minutes: 8
goals:
  - "算出 2 乘 2 的四个整数"
  - "在一个两张图的批量上重复"
  - "确认右下角仍是 43"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-15"
---

输入是 0 到 8 排成的 3 乘 3，核是 [[0, 1], [2, 3]]，偏置是 0。互相关的四格是 19、25、37、43。

### 四格整数

每一格都是当前窗口和核的乘积之和。核往右一列，窗口多看到的是更大的像素，所以右边两格更大。

```numpy run expect="19 25 37 43" title="四格整数"
# 手算的四格
import minitorch as mt
image = mt.tensor([[[[0.0, 1.0, 2.0], [3.0, 4.0, 5.0], [6.0, 7.0, 8.0]]]])
weight = mt.tensor([[[[0.0, 1.0], [2.0, 3.0]]]])
bias = mt.tensor([0.0])
y = mt.conv2d(image, weight, bias)
print(int(y.data[0, 0, 0, 0]), int(y.data[0, 0, 0, 1]), int(y.data[0, 0, 1, 0]), int(y.data[0, 0, 1, 1]))
```

### 批量维叠两张同样的图

两张相同的图叠在批量维。第二张的右下角仍是 43，形状的第一维是 2。

```numpy run expect="batch 2 43" title="批量维叠两张同样的图"
# 两张相同的图
import minitorch as mt
import numpy as np
image = np.array([[[[0.0, 1.0, 2.0], [3.0, 4.0, 5.0], [6.0, 7.0, 8.0]]]])
pair = np.concatenate([image, image], axis=0)
weight = mt.tensor([[[[0.0, 1.0], [2.0, 3.0]]]])
bias = mt.tensor([0.0])
y = mt.conv2d(mt.tensor(pair), weight, bias)
print("batch", y.shape[0], int(y.data[1, 0, 1, 1]))
```

### 实现不是逐点的 Python 循环

im2col 先把窗口排成矩阵，再和拉直的核相乘。反向把梯度送回重叠的窗口。

延伸阅读：[互相关](https://zh.d2l.ai/chapter_convolutional-neural-networks/conv-layer.html)，英文页在[这里](https://d2l.ai/chapter_convolutional-neural-networks/conv-layer.html)。
