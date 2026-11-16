---
language: dl
chapter: 57
title: "循环神经网络单元"
level: beginner
minutes: 8
goals:
  - "用 tanh 写一个时间步"
  - "核对隐藏形状是 1 乘 1 乘 2"
  - "记住输入在批量的外侧"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

一个时间步把当前输入和上一隐藏状态都乘上矩阵，加上偏置，再过 tanh。输入的形状是批量、时间、特征。

### 手写一个时间步

权重是对角的 0.5。输入 1 和 2 经过 tanh 之后，两个隐藏值可以手算。

```numpy run expect="h0 0.4621" title="手写一个时间步"
# 对角权重
import minitorch as mt
w_ih = mt.tensor([[0.5, 0.0], [0.0, 0.5]])
w_hh = mt.tensor([[0.0, 0.0], [0.0, 0.0]])
b = mt.tensor([0.0, 0.0])
x = mt.tensor([[1.0, 2.0]])
h = mt.tensor([[0.0, 0.0]])
y = (x @ w_ih.T + h @ w_hh.T + b).tanh()
print("h0", round(float(y.data[0, 0]), 4))
print("h1", round(float(y.data[0, 1]), 4))
```

### 批量在最外面

模块收到的张量是 1 乘 1 乘 3：一条样本，一个时间步，三个特征。输出把隐藏维放在最后。

```numpy run expect="shape 1 1 2" title="批量在最外面"
# 一个时间步
import minitorch as mt
import numpy as np
np.random.seed(0)
x = mt.tensor([[0.2, -0.1, 0.4]])
h = mt.tensor([[0.0, 0.0]])
cell = mt.nn.RNN(3, 2)
y, h2 = cell(x.reshape(1, 1, 3), h)
print("shape", y.shape[0], y.shape[1], y.shape[2])
```

### 公式先于训练

这一页没有四步更新。循环单元页只核对 tanh 的两个小数，以及 1 乘 1 乘 2 的输出形状。

延伸阅读：[循环神经网络单元](https://zh.d2l.ai/chapter_recurrent-neural-networks/rnn.html)，英文页在[这里](https://d2l.ai/chapter_recurrent-neural-networks/rnn.html)。
