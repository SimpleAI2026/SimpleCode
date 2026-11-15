---
language: dl
chapter: 86
title: "RMSProp"
level: intermediate
minutes: 8
goals:
  - "让旧的梯度平方衰减"
  - "四步后打印 loss"
  - "核对第一步的位置"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-13"
---

平方累加器每步先乘 0.9，再加上 0.1 倍的新梯度平方。学习率 0.1，仍从 0 走向 3，四步后打印 loss。

### 带遗忘的四步

rho 是 0.9。和 AdaGrad 相比，很早的梯度平方不会永远占满分母。

```numpy run expect="loss" title="RMSProp 四步"
# rho 0.9
import minitorch as mt
w = mt.tensor([0.0], requires_grad=True)
opt = mt.optim.RMSProp([w], lr=0.1, rho=0.9)
last = 0.0
for _ in range(4):
    opt.zero_grad()
    loss = ((w - 3.0) * (w - 3.0)).sum()
    loss.backward()
    opt.step()
    last = loss.item()
print("loss", round(last, 4))
```

### 第一步的分母

累加器从 0 开始，第一步只留下 0.1 乘 36。分母大约是 1.897。这一段把第一步之后的参数印出来。

```numpy run expect="0.3162" title="第一步"
# 只保留一成平方
grad = -6.0
accum = 0.1 * grad * grad
step = 0.1 * grad / (accum ** 0.5 + 1e-8)
print(round(0.0 - step, 4))
```

### Adadelta 再记一次更新量

RMSProp 的分子仍是学习率乘梯度。Adadelta 用最近几次实际走了多远来替换这个分子的尺度。

延伸阅读：[RMSProp](https://zh.d2l.ai/chapter_optimization/rmsprop.html)，英文页在[这里](https://d2l.ai/chapter_optimization/rmsprop.html)。
