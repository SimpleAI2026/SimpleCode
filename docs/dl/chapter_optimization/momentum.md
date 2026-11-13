---
language: dl
chapter: 84
title: "动量法"
level: intermediate
minutes: 8
goals:
  - "用速度累积梯度"
  - "四步后打印 loss"
  - "手算第一步的位置"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-13"
---

速度是上一步速度乘 0.5 再加当前梯度。参数用学习率 0.2 去减这个速度。目标仍是把一个数从 0 送到 3，只走四步。

### 四步动量

损失是参数减 3 的平方。第四步结束时打印 loss。速度会把前几步的方向留一点下来。

```numpy run expect="loss" title="动量四步"
# 动量系数 0.5
import minitorch as mt
w = mt.tensor([0.0], requires_grad=True)
opt = mt.optim.Momentum([w], lr=0.2, momentum=0.5)
last = 0.0
for _ in range(4):
    opt.zero_grad()
    loss = ((w - 3.0) * (w - 3.0)).sum()
    loss.backward()
    opt.step()
    last = loss.item()
print("loss", round(last, 4))
```

### 第一步的速度

从 0 出发时，平方损失对参数的梯度是 -6。速度等于这个梯度，参数变成 1.2。这一段只算第一步。

```numpy run expect="1.2" title="第一步"
# 0 - 0.2 * (-6)
v = 0.0
grad = -6.0
v = 0.5 * v + grad
print(round(0.0 - 0.2 * v, 4))
```

### 后面几种方法改的是分母

动量不看梯度的历史平方。AdaGrad 会把梯度的平方累加起来，用它的平方根去除这一步。

延伸阅读：[动量法](https://zh.d2l.ai/chapter_optimization/momentum.html)，英文页在[这里](https://d2l.ai/chapter_optimization/momentum.html)。
