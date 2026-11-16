---
language: dl
chapter: 42
title: "多个通道"
level: beginner
minutes: 8
goals:
  - "把两个输入通道加在一起"
  - "得到 56、72、104、120"
  - "再看两个输出通道的形状"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-15"
---

多个输入通道各自做互相关，再逐格相加。下面第一通道是 0 到 8，第二通道是 1 到 9，两个核分别是 [[0, 1], [2, 3]] 和 [[1, 2], [3, 4]]。

### 两个通道相加

第一通道单独的四格是 19、25、37、43。第二通道是 37、47、67、77。相加得到 56、72、104、120。

```numpy run expect="56 72 104 120" title="两个通道相加"
# 两个输入通道
import minitorch as mt
image = mt.tensor([[[[0.0, 1.0, 2.0], [3.0, 4.0, 5.0], [6.0, 7.0, 8.0]], [[1.0, 2.0, 3.0], [4.0, 5.0, 6.0], [7.0, 8.0, 9.0]]]])
weight = mt.tensor([[[[0.0, 1.0], [2.0, 3.0]], [[1.0, 2.0], [3.0, 4.0]]]])
bias = mt.tensor([0.0])
y = mt.conv2d(image, weight, bias)
print(int(y.data[0, 0, 0, 0]), int(y.data[0, 0, 0, 1]), int(y.data[0, 0, 1, 0]), int(y.data[0, 0, 1, 1]))
```

### 两个输出通道

把核在输出维上叠一份加 1 之后的拷贝。输出通道数是 2，第 0 个通道的左上角仍是 56。

```numpy run expect="shape 2 56" title="两个输出通道"
# 输出通道是 2
import minitorch as mt
import numpy as np
image = mt.tensor([[[[0.0, 1.0, 2.0], [3.0, 4.0, 5.0], [6.0, 7.0, 8.0]], [[1.0, 2.0, 3.0], [4.0, 5.0, 6.0], [7.0, 8.0, 9.0]]]])
base = np.array([[[[0.0, 1.0], [2.0, 3.0]], [[1.0, 2.0], [3.0, 4.0]]]])
weight = mt.tensor(np.concatenate([base, base + 1.0], axis=0))
bias = mt.tensor([0.0, 0.0])
y = mt.conv2d(image, weight, bias)
print("shape", y.shape[1], int(y.data[0, 0, 0, 0]))
```

### 1 乘 1 的核只混合通道

核的高和宽都是 1 时，每个空间位置上做的是通道之间的线性组合，空间尺寸不变。后面的 NiN 会用到这种层。

延伸阅读：[多个通道](https://zh.d2l.ai/chapter_convolutional-neural-networks/channels.html)，英文页在[这里](https://d2l.ai/chapter_convolutional-neural-networks/channels.html)。
