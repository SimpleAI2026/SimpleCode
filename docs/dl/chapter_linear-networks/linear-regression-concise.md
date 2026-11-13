---
language: dl
chapter: 15
title: "线性回归的简洁实现"
level: beginner
minutes: 8
goals:
  - "用线性层拟合直线"
  - "用 SGD 更新四步"
  - "核对单行输入的输出形状"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-13"
---

同一条合成直线改用线性层和随机梯度下降。层的权重在构造时随机初始化，所以块里先固定随机种子。四步之后仍在八个新点上算一次损失。

### 线性层加四步

输入维和输出维都是 1。优化器每次把参数里的梯度乘学习率再减掉。训练损失和验证损失打印在同一行。

```numpy run expect="loss" title="简洁四步"
# 种子固定后再建层
import numpy as np
import minitorch as mt
np.random.seed(0)
rng = np.random.default_rng(0)
x = mt.tensor(rng.random((32, 1)))
y = mt.tensor(1.0 + 2.0 * x.data)
net = mt.nn.Linear(1, 1)
opt = mt.optim.SGD(net.parameters(), lr=0.2)
last = 0.0
for _ in range(4):
    opt.zero_grad()
    pred = net(x)
    loss = ((pred - y) * (pred - y)).mean()
    loss.backward()
    opt.step()
    last = loss.item()
rng2 = np.random.default_rng(2)
xv = mt.tensor(rng2.random((8, 1)))
yv = mt.tensor(1.0 + 2.0 * xv.data)
vloss = ((net(xv) - yv) * (net(xv) - yv)).mean()
print("loss", round(last, 4), round(vloss.item(), 4))
```

### 单行输入的形状

把一个 0.5 送进同一类线性层，输出是一行一列。这一段不更新参数，只核对形状，避免和上一段的四步混在一次运行里。

```numpy run expect="shape 1 1" title="输出形状"
# 输出应是 1 行 1 列
import minitorch as mt
import numpy as np
np.random.seed(1)
layer = mt.nn.Linear(1, 1)
out = layer(mt.tensor([[0.5]]))
print("shape", out.shape[0], out.shape[1])
```

### 图片分类会把输出维改成 10

直线的输出是一个数。服装图片的线性层会把 784 维像素映到 10 个分数。结构仍是这一节的层，只是宽度不同。

延伸阅读：[线性回归的简洁实现](https://zh.d2l.ai/chapter_linear-networks/linear-regression-concise.html)，英文页在[这里](https://d2l.ai/chapter_linear-networks/linear-regression-concise.html)。
