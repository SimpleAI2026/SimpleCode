---
language: dl
chapter: 23
title: "感知机的简洁实现"
level: intermediate
minutes: 8
goals:
  - "用序列装入整流"
  - "训练四步后关掉训练标记"
  - "数出参数列表的长度"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-13"
---

三步放进一个序列。训练时调用 train，四步结束后调用 eval，再对八张检查图取 acc。参数个数在另一段里打印。

### 序列上的四步

种子是 2，学习率是 0.2。eval 之后暂退层会停用，这一节还没有暂退，调用它只是把训练标记关掉。

```numpy run expect="loss" title="简洁感知机"
# 先 train 再 eval
import minitorch as mt
import numpy as np
np.random.seed(2)
x, y, xt, yt = mt.datasets.fashion_mnist()
net = mt.nn.Sequential(mt.nn.Linear(784, 32), mt.nn.ReLU(), mt.nn.Linear(32, 10))
net.train()
opt = mt.optim.SGD(net.parameters(), lr=0.2)
last = 0.0
for step in range(4):
    opt.zero_grad()
    xb = mt.tensor(mt.datasets.scale_batch(x[step * 4:(step + 1) * 4]))
    yb = y[step * 4:(step + 1) * 4]
    loss = mt.cross_entropy(net(xb), yb)
    loss.backward()
    opt.step()
    last = loss.item()
net.eval()
acc = mt.accuracy(net(mt.tensor(mt.datasets.scale_batch(xt))), yt)
print("loss", round(last, 4))
print("acc", round(acc, 3))
```

### 两层线性各有权重和偏置

序列里有三个阶段，其中两个线性层各贡献权重和偏置，所以参数列表长度是 4。整流没有参数。

```numpy run expect="layers 3 params 4" title="参数个数"
# 整流没有参数
import minitorch as mt
import numpy as np
np.random.seed(3)
net = mt.nn.Sequential(mt.nn.Linear(784, 32), mt.nn.ReLU(), mt.nn.Linear(32, 10))
print("layers", len(net.layers), "params", len(net.parameters()))
```

### 欠拟合改用多项式

图片上的四步看不出模型太简单还是太复杂。下一节改用一条合成多项式，比较一次项和三次项两套特征。

延伸阅读：[感知机的简洁实现](https://zh.d2l.ai/chapter_multilayer-perceptrons/mlp-concise.html)，英文页在[这里](https://d2l.ai/chapter_multilayer-perceptrons/mlp-concise.html)。
