---
language: dl
chapter: 21
title: "多层感知机"
level: intermediate
minutes: 8
goals:
  - "看整流如何处理负数"
  - "搭建一个小的三层前向"
  - "核对输出形状"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-13"
---

整流的数值例子只用三个数。另一段把四维输入送进八个隐藏单元，再收到三个输出，只打印形状。

### 三个数的整流

负的 1.5 变成 0，0 仍是 0，2.5 保持 2.5。打印时前两个取整数，最后一个保留小数。

```numpy run expect="0 0 2.5" title="整流数值"
# 负数被截成 0
import minitorch as mt
x = mt.tensor([-1.5, 0.0, 2.5])
y = x.relu()
print(int(y.data[0]), int(y.data[1]), y.data[2])
```

### 四维输入的形状

种子固定后建一个序列：线性层、整流、再一个线性层。一行四列进去，一行三列出来。这一段不计算损失。

```numpy run expect="shape 1 3" title="前向形状"
# 隐藏宽度是 8
import minitorch as mt
import numpy as np
np.random.seed(0)
net = mt.nn.Sequential(mt.nn.Linear(4, 8), mt.nn.ReLU(), mt.nn.Linear(8, 3))
out = net(mt.tensor([[1.0, 0.0, 0.0, 1.0]]))
print("shape", out.shape[0], out.shape[1])
```

### 训练留在下一节

把这个结构接到 784 个像素上时，隐藏宽度改成 32，输出改成 10。那一节才做四步更新。

延伸阅读：[多层感知机](https://zh.d2l.ai/chapter_multilayer-perceptrons/mlp.html)，英文页在[这里](https://d2l.ai/chapter_multilayer-perceptrons/mlp.html)。
