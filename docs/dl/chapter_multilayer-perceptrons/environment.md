---
language: dl
chapter: 29
title: "环境和分布偏移"
level: intermediate
minutes: 8
goals:
  - "在平移后的输入上训练四步"
  - "比较训练损失和检查损失"
  - "打印两组均值的差"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-13"
---

训练的三十二个 x 来自标准正态，检查的八个 x 整体挪到均值 1.5 附近。标签都是 0.3x 加 0.1。四步只在训练切片上更新，再对八个检查点算一次损失。

### 四步训练和一次检查

权重和偏置从 0 开始，学习率 0.1。每步四行。打印训练损失和检查损失。检查损失可以更大，因为输入已经挪走了。

```numpy run expect="loss" title="偏移上的四步"
# 检查集均值大约 1.5
import numpy as np
import minitorch as mt
rng = np.random.default_rng(0)
train_x = rng.normal(0.0, 1.0, size=(32, 1))
train_y = 0.3 * train_x[:, 0] + 0.1
val_x = rng.normal(1.5, 1.0, size=(8, 1))
val_y = 0.3 * val_x[:, 0] + 0.1
w = mt.tensor(np.zeros(1), requires_grad=True)
b = mt.tensor(np.zeros(1), requires_grad=True)
last = 0.0
for step in range(4):
    xb = train_x[step * 4:(step + 1) * 4]
    yb = train_y[step * 4:(step + 1) * 4]
    w.grad = None
    b.grad = None
    pred = mt.tensor(xb) @ w + b
    loss = ((pred - mt.tensor(yb)) * (pred - mt.tensor(yb))).mean()
    loss.backward()
    w.data -= 0.1 * w.grad
    b.data -= 0.1 * b.grad
    last = loss.item()
vpred = mt.tensor(val_x) @ w + b
vloss = ((vpred - mt.tensor(val_y)) * (vpred - mt.tensor(val_y))).mean()
print("loss", round(last, 4), round(vloss.item(), 4))
```

### 均值差

同一对种子再抽一次，只打印检查均值减去训练均值。差应在 1 附近，三位小数由种子决定。

```numpy run expect="shift" title="均值差"
# 两个正态的均值差
import numpy as np
rng = np.random.default_rng(0)
train_x = rng.normal(0.0, 1.0, size=32)
val_x = rng.normal(1.5, 1.0, size=8)
print("shift", round(float(val_x.mean() - train_x.mean()), 3))
```

### 真实房价也会换分布

下一节的小表把特征先按训练行标准化，再拿到检查行上。那是另一种避免尺度差的办法，不是这一节的随机平移。

延伸阅读：[环境和分布偏移](https://zh.d2l.ai/chapter_multilayer-perceptrons/environment.html)，英文页在[这里](https://d2l.ai/chapter_multilayer-perceptrons/environment.html)。
