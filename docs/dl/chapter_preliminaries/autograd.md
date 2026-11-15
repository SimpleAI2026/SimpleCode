---
language: dl
chapter: 9
title: "自动微分"
level: beginner
minutes: 8
goals:
  - "对平方和做反向"
  - "读出每个输入的梯度"
  - "检查指数和对数的梯度"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-13"
---

标量损失可以反向走到每个需要梯度的输入。平方和的梯度是两倍的输入。指数再取对数应把梯度变回 1。

### 平方和的梯度

输入是 2 和 3。每个位置先平方再相加，反向之后两个梯度分别是 4 和 6。反向只接受一个标量，所以先求和。

```numpy run expect="4 6" title="平方和"
# 梯度应是输入的两倍
import minitorch as mt
x = mt.tensor([2.0, 3.0], requires_grad=True)
y = (x * x).sum()
y.backward()
print(int(x.grad[0]), int(x.grad[1]))
```

### 指数和对数抵消

先做指数再做对数，函数值回到输入本身。对输入 2 求导，结果四舍五入到 1。这两支运算都记在同一张计算图上。

```numpy run expect="1.0" title="指数与对数"
# log(exp(x)) 的梯度
import minitorch as mt
x = mt.tensor([2.0], requires_grad=True)
y = x.exp().log()
y.backward()
print(round(float(x.grad[0]), 4))
```

### 不需要梯度时就别记

数据批量本身不要求梯度。只有权重那几个张量打开记录。这样四步更新不会把整张图片也卷进反向。

延伸阅读：[自动微分](https://zh.d2l.ai/chapter_preliminaries/autograd.html)，英文页在[这里](https://d2l.ai/chapter_preliminaries/autograd.html)。
