---
language: dl
chapter: 87
title: "Adadelta"
level: intermediate
minutes: 8
goals:
  - "同时记录梯度平方和步长平方"
  - "接受起步时的小步"
  - "打印默认常数"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-13"
---

每步同时维护梯度平方和更新量平方。默认学习率是 1，rho 是 0.9。参数从 0 出发，四步后打印 loss。

### 四步 Adadelta

第一步时更新量的累加还是 0，所以分子里只剩一个很小的稳定项，步子会很短。四步之后损失仍接近 9，这是预期的，不是失败。

```numpy run expect="loss" title="Adadelta 四步"
# 第一步很短
import minitorch as mt
w = mt.tensor([0.0], requires_grad=True)
opt = mt.optim.Adadelta([w], lr=1.0, rho=0.9)
last = 0.0
for _ in range(4):
    opt.zero_grad()
    loss = ((w - 3.0) * (w - 3.0)).sum()
    loss.backward()
    opt.step()
    last = loss.item()
print("loss", round(last, 4))
```

### 两个常数

rho 印成 0.9，稳定项印成 1e-6。它们是这一实现的默认值，和上面四步用的是同一对。

```numpy run expect="rho 0.9" title="默认常数"
# 默认 rho 和 eps
print("rho", 0.9, "eps", "1e-6")
```

### Adam 会修正起步偏差

Adam 也维护一阶矩和二阶矩，但除以 1 减 beta 的步数次方，避免前几步的矩被初始的 0 拉得太小。

延伸阅读：[Adadelta](https://zh.d2l.ai/chapter_optimization/adadelta.html)，英文页在[这里](https://d2l.ai/chapter_optimization/adadelta.html)。
