---
language: dl
chapter: 50
title: "批量规范化"
level: intermediate
minutes: 8
goals:
  - "在 2 乘 2 上看到接近正负 1"
  - "把层插进 LeNet"
  - "训练时更新运行中的均值"
sources:
  - d2l-zh-text
  - d2l-en-text
  - fashion-mnist
updated: "2026-11-15"
---

批量规范化按通道减均值、除以标准差，再乘 gamma、加 beta。gamma 初始是 1，beta 初始是 0。训练时用当前批量的统计量，并顺手更新 running mean 和 running var。评估时只用那两份运行统计。

### 一个 2 乘 2 的例子

两行是一个批量，两列是两个通道。第一列是 1 和 3，均值 2，中心化之后约为 -1 和 1。eps 让打印值在四位小数上仍是 -1.0 和 1.0。

```numpy run expect="cell -1.0 1.0" title="一个 2 乘 2 的例子"
# 两行两列
import minitorch as mt
raw = mt.tensor([[1.0, 2.0], [3.0, 4.0]])
norm = mt.nn.BatchNorm(2)
y = norm(raw)
print("cell", round(float(y.data[0, 0]), 4), round(float(y.data[1, 0]), 4))
```

### 插进 LeNet 走四步

在两层卷积之后、sigmoid 之前各放一个 BatchNorm。其余结构和 LeNet 那一节相同，仍是 28 的输入、四步、一批四张、八张检查图。

```numpy run expect="loss" title="插进 LeNet 走四步"
# 卷积后做规范化
import minitorch as mt
import numpy as np
np.random.seed(0)
x, y, xt, yt = mt.datasets.fashion_mnist()
net = mt.nn.Sequential(
    mt.nn.Conv2d(1, 6, 5, padding=2), mt.nn.BatchNorm(6), mt.nn.Sigmoid(),
    mt.nn.AvgPool2d(2, stride=2),
    mt.nn.Conv2d(6, 16, 5), mt.nn.BatchNorm(16), mt.nn.Sigmoid(),
    mt.nn.AvgPool2d(2, stride=2),
    mt.nn.Flatten(),
    mt.nn.Linear(400, 120), mt.nn.Sigmoid(),
    mt.nn.Linear(120, 84), mt.nn.Sigmoid(),
    mt.nn.Linear(84, 10),
)
opt = mt.optim.SGD(net.parameters(), lr=0.1)
last = 0.0
for step in range(4):
    opt.zero_grad()
    xb = mt.datasets.scale_batch(x[step * 4:(step + 1) * 4]).reshape(4, 1, 28, 28)
    loss = mt.cross_entropy(net(mt.tensor(xb)), y[step * 4:(step + 1) * 4])
    loss.backward()
    opt.step()
    last = loss.item()
net.eval()
acc = mt.accuracy(net(mt.tensor(mt.datasets.scale_batch(xt).reshape(8, 1, 28, 28))), yt)
print("loss", round(last, 4))
print("acc", round(acc, 3))
```

### eval 换用运行统计

四步里每次前向都按动量 0.1 混合运行统计。调用 eval 之后，检查图不再用那八张自己的均值。

延伸阅读：[批量规范化](https://zh.d2l.ai/chapter_convolutional-modern/batch-norm.html)，英文页在[这里](https://d2l.ai/chapter_convolutional-modern/batch-norm.html)。
