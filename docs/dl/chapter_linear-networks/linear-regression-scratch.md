---
language: dl
chapter: 14
title: "线性回归从零开始"
level: beginner
minutes: 8
goals:
  - "从零写平方损失"
  - "手动做四次更新"
  - "在八个新点上再算损失"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-13"
---

权重和偏置从 0 开始，三十二个合成点仍来自 y = 1 + 2x。每次用全部点算一个平方损失，走四步，再在另外八个点上算一次损失。

### 四步之后再评估

学习率取 0.5。四步里每步都把梯度清掉再反向，避免梯度累加。最后一行同时打印训练损失和八个新点上的损失。

```numpy run expect="loss" title="手写四步"
# 合成直线上的四步
import numpy as np
import minitorch as mt
rng = np.random.default_rng(0)
x = mt.tensor(rng.random((32, 1)))
y = mt.tensor(1.0 + 2.0 * x.data)
w = mt.tensor(np.zeros((1, 1)), requires_grad=True)
b = mt.tensor(np.zeros(1), requires_grad=True)
last = 0.0
for _ in range(4):
    pred = x @ w.T + b
    loss = ((pred - y) * (pred - y)).mean()
    loss.backward()
    w.data -= 0.5 * w.grad
    b.data -= 0.5 * b.grad
    w.grad = None
    b.grad = None
    last = loss.item()
rng2 = np.random.default_rng(1)
xv = mt.tensor(rng2.random((8, 1)))
yv = mt.tensor(1.0 + 2.0 * xv.data)
vpred = xv @ w.T + b
vloss = ((vpred - yv) * (vpred - yv)).mean()
print("loss", round(last, 4), round(vloss.item(), 4))
```

### 批量大小写在形状里

真正的循环用了全部 32 个点，因为它们本来就是书上那种小例子的规模。另一段只打印 4 这个批量记号和步数，提醒后面的图片节会改成每次四行。

```numpy run expect="batch 4 steps 4" title="批量记号"
# 标出批量和步数
import numpy as np
x = np.linspace(0.0, 1.0, 4).reshape(4, 1)
print("batch", x.shape[0], "steps", 4)
```

### 不追求把斜率读到小数点后很多位

四步只说明梯度能改权重。把 2 和 1 恢复到很高精度不是这一节的要求，输出里出现 loss 即可。

延伸阅读：[线性回归从零开始](https://zh.d2l.ai/chapter_linear-networks/linear-regression-scratch.html)，英文页在[这里](https://d2l.ai/chapter_linear-networks/linear-regression-scratch.html)。
