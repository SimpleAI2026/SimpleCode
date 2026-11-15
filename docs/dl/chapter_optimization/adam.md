---
language: dl
chapter: 88
title: "Adam"
level: intermediate
minutes: 8
goals:
  - "使用一阶矩和二阶矩"
  - "四步后打印 loss"
  - "核对偏差修正"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-13"
---

一阶矩和二阶矩都从 0 开始。每步先做指数滑动，再除以 1 减 beta 的步数次方。学习率 0.2，四步后打印 loss。

### 四步带偏差修正

默认 beta 是 0.9 和 0.999。修正之后，第一步的一阶矩不会停留在梯度的一成。结束时打印 loss。

```numpy run expect="loss" title="Adam 四步"
# 学习率 0.2
import minitorch as mt
w = mt.tensor([0.0], requires_grad=True)
opt = mt.optim.Adam([w], lr=0.2)
last = 0.0
for _ in range(4):
    opt.zero_grad()
    loss = ((w - 3.0) * (w - 3.0)).sum()
    loss.backward()
    opt.step()
    last = loss.item()
print("loss", round(last, 4))
```

### 修正后的一阶矩

若梯度是 0.4，未修正的一阶矩是 0.04。除以 0.1 之后回到 0.4。这一段只印这个修正，不更新参数。

```numpy run expect="0.4" title="偏差修正"
# 0.04 除以 0.1
beta1 = 0.9
moment = (1.0 - beta1) * 0.4
corrected = moment / (1.0 - beta1)
print(round(corrected, 4))
```

### 学习率还可以再乘倍率

Adam 内部的学习率在四步里不变。下一节在优化器外面每两步把学习率乘 0.5。

延伸阅读：[Adam](https://zh.d2l.ai/chapter_optimization/adam.html)，英文页在[这里](https://d2l.ai/chapter_optimization/adam.html)。
