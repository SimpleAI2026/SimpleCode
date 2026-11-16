---
language: dl
chapter: 39
title: "局部窗口"
level: beginner
minutes: 8
goals:
  - "用四个像素和一个核做点积"
  - "看到左上角结果是 19"
  - "对比整张图的互相关"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-15"
---

全连接会让每个输出看见全部像素。卷积只让一个输出看见一小块。左上角 2 乘 2 的窗口和核做点积，结果是 19。

### 只看四个数

窗口是 0、1、3、4，核是 0、1、2、3。点积是 0 加 1 加 6 加 12，等于 19。其余五个像素这次不参与。

```numpy run expect="dot 19" title="只看四个数"
# 左上角四个像素
import numpy as np
window = np.array([[0.0, 1.0], [3.0, 4.0]])
kernel = np.array([[0.0, 1.0], [2.0, 3.0]])
print("dot", int((window * kernel).sum()))
```

### 同一个核扫完整张图

Conv2d 用 im2col 把每个窗口排成一行再做矩阵乘，不在 Python 里逐像素循环。左上角仍然是 19，右下角是 43。

```numpy run expect="19 43" title="同一个核扫完整张图"
# 两个角
import minitorch as mt
image = mt.tensor([[[[0.0, 1.0, 2.0], [3.0, 4.0, 5.0], [6.0, 7.0, 8.0]]]])
weight = mt.tensor([[[[0.0, 1.0], [2.0, 3.0]]]])
bias = mt.tensor([0.0])
y = mt.conv2d(image, weight, bias)
print(int(y.data[0, 0, 0, 0]), int(y.data[0, 0, 1, 1]))
```

### 权重在窗口之间重复

四个输出位置用的是同一份 2 乘 2 的核。全连接要为每个位置准备不同的系数，参数会多得多。

延伸阅读：[局部窗口](https://zh.d2l.ai/chapter_convolutional-neural-networks/why-conv.html)，英文页在[这里](https://d2l.ai/chapter_convolutional-neural-networks/why-conv.html)。
