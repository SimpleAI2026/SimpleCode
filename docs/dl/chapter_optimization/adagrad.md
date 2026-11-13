---
language: dl
chapter: 85
title: "AdaGrad"
level: intermediate
minutes: 8
goals:
  - "累加梯度的平方"
  - "四步后打印 loss"
  - "手算第一步到达 0.5"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-13"
---

每步把梯度的平方加进累加器，再用学习率乘梯度除以累加器的平方根。从 0 靠近 3，学习率 0.5，四步。

### 四步累加

累加器从 0 开始。梯度一大，后面的步子会变短。结束时打印 loss。

```numpy run expect="loss" title="AdaGrad 四步"
# 学习率 0.5
import minitorch as mt
w = mt.tensor([0.0], requires_grad=True)
opt = mt.optim.AdaGrad([w], lr=0.5)
last = 0.0
for _ in range(4):
    opt.zero_grad()
    loss = ((w - 3.0) * (w - 3.0)).sum()
    loss.backward()
    opt.step()
    last = loss.item()
print("loss", round(last, 4))
```

### 第一步的位移

梯度 -6 的平方是 36，平方根是 6。0.5 乘 -6 再除以 6，得到 -0.5，参数从 0 变成 0.5。

```numpy run expect="0.5" title="第一步位移"
# 第一步应到 0.5
grad = -6.0
accum = grad * grad
step = 0.5 * grad / (accum ** 0.5 + 1e-8)
print(round(0.0 - step, 4))
```

### RMSProp 会忘掉太旧的平方

AdaGrad 的累加器只增不减。下一节用一个小于 1 的系数把旧的平方慢慢忘掉。

延伸阅读：[AdaGrad](https://zh.d2l.ai/chapter_optimization/adagrad.html)，英文页在[这里](https://d2l.ai/chapter_optimization/adagrad.html)。
