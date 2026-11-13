---
language: dl
chapter: 83
title: "小批量随机梯度下降"
level: intermediate
minutes: 8
goals:
  - "读取 32 行机翼表"
  - "按四行更新四步"
  - "在最后八行上再算损失"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-13"
---

三十二行合成机翼数据，五列输入。按全部行计算均值和标准差之后，每步取四行，走四步，再用最后八行算一次损失。

### 四行一批

学习率 0.05。目标先减去全体平均，避免声音那一列的大数把平方损失撑爆。两处损失打印在一行。

```numpy run expect="loss" title="机翼四步"
# 32 行里的前 16 行参与四步
import numpy as np
import minitorch as mt
x, y = mt.datasets.airfoil()
mu = x.mean(axis=0)
sd = np.where(x.std(axis=0) < 1e-8, 1.0, x.std(axis=0))
xz = (x - mu) / sd
yz = y - y.mean()
w = mt.tensor(np.zeros(xz.shape[1]), requires_grad=True)
b = mt.tensor(np.zeros(1), requires_grad=True)
last = 0.0
for step in range(4):
    xb = xz[step * 4:(step + 1) * 4]
    yb = yz[step * 4:(step + 1) * 4]
    w.grad = None
    b.grad = None
    pred = mt.tensor(xb) @ w + b
    loss = ((pred - mt.tensor(yb)) * (pred - mt.tensor(yb))).mean()
    loss.backward()
    w.data -= 0.05 * w.grad
    b.data -= 0.05 * b.grad
    last = loss.item()
vpred = mt.tensor(xz[24:32]) @ w + b
vloss = ((vpred - mt.tensor(yz[24:32])) * (vpred - mt.tensor(yz[24:32]))).mean()
print("loss", round(last, 4), round(float(vloss.item()), 4))
```

### 行数和列数

三十二行、五个特征。目标列不在特征里。这一段只打印形状。

```numpy run expect="rows 32 features 5" title="机翼形状"
# 五列输入
import minitorch as mt
x, y = mt.datasets.airfoil()
print("rows", x.shape[0], "features", x.shape[1])
```

### 原文件不放进仓库

UCI 的机翼噪声文件没有下载。这里的三十二行由构建脚本按固定种子生成，大约两千字节。

延伸阅读：[小批量随机梯度下降](https://zh.d2l.ai/chapter_optimization/minibatch-sgd.html)，英文页在[这里](https://d2l.ai/chapter_optimization/minibatch-sgd.html)。
