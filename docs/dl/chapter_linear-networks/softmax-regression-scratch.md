---
language: dl
chapter: 18
title: "softmax 从零开始"
level: beginner
minutes: 8
goals:
  - "用手写权重做四步"
  - "打印 loss"
  - "在八张图上打印 acc"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-13"
---

权重是 10 行 784 列的零矩阵，偏置也是零。每次取四张已经缩放过的图，走四步交叉熵，再在八张检查图上打印一次 acc。

### 四步和一次检查

学习率 0.1。每步反向之后立刻把梯度清掉。最后两行分别是 loss 和 acc。acc 可以很低，这一节不把它当门槛。

```numpy run expect="loss" title="手写 softmax"
# 零权重出发的四步
import minitorch as mt
import numpy as np
x, y, xt, yt = mt.datasets.fashion_mnist()
w = mt.tensor(np.zeros((10, 784)), requires_grad=True)
b = mt.tensor(np.zeros(10), requires_grad=True)
last = 0.0
for step in range(4):
    xb = mt.tensor(mt.datasets.scale_batch(x[step * 4:(step + 1) * 4]))
    yb = y[step * 4:(step + 1) * 4]
    logits = xb @ w.T + b
    loss = mt.cross_entropy(logits, yb)
    loss.backward()
    w.data -= 0.1 * w.grad
    b.data -= 0.1 * b.grad
    w.grad = None
    b.grad = None
    last = loss.item()
vlogits = mt.tensor(mt.datasets.scale_batch(xt)) @ w.T + b
acc = mt.accuracy(vlogits, yt)
print("loss", round(last, 4))
print("acc", round(acc, 3))
```

### 标签条数

训练标签 32 个，检查标签 8 个。四步只用到前 16 个训练标签，剩下的不在这四步里，检查集整份只用一次。

```numpy run expect="labels 32 8" title="标签条数"
# 32 个训练标签
import minitorch as mt
x, y, xt, yt = mt.datasets.fashion_mnist()
print("labels", int(y.shape[0]), int(yt.shape[0]))
```

### 简洁实现换成现成的层

手写的矩阵乘和线性层的前向是同一件事。下一节把权重交给 Linear，更新交给 SGD，步数和数据不变。

延伸阅读：[softmax 从零开始](https://zh.d2l.ai/chapter_linear-networks/softmax-regression-scratch.html)，英文页在[这里](https://d2l.ai/chapter_linear-networks/softmax-regression-scratch.html)。
