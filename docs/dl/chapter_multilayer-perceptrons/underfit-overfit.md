---
language: dl
chapter: 24
title: "欠拟合和过拟合"
level: intermediate
minutes: 8
goals:
  - "用一次特征拟合曲线"
  - "用到三次的特征再走四步"
  - "两段都打印 loss"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-13"
---

三十二个 x 来自固定种子，目标是常数加一次项再减一个平方项。先用一次特征走四步，再用到三次的特征走四步，各印一个 loss。

### 一次特征的四步

特征只有一列 1 和一列 x。权重从 0 开始，学习率 0.3。四步结束时的平方损失写成 loss。样本只有 32 个，不再另留验证。

```numpy run expect="loss" title="一次特征"
# 一次项拟合平方曲线
import numpy as np
import minitorch as mt
rng = np.random.default_rng(0)
x = rng.random((32, 1)) * 2.0 - 1.0
target = 0.4 + 1.1 * x[:, 0] - 0.7 * (x[:, 0] ** 2)
feat = np.concatenate([np.ones((32, 1)), x], axis=1)
w = mt.tensor(np.zeros(feat.shape[1]), requires_grad=True)
last = 0.0
for _ in range(4):
    w.grad = None
    pred = mt.tensor(feat) @ w
    yt = mt.tensor(target)
    loss = ((pred - yt) * (pred - yt)).mean()
    loss.backward()
    w.data -= 0.3 * w.grad
    last = loss.item()
print("loss", round(last, 4))
```

### 加到三次

同一批 x 再拼上平方和立方。四步的学习率不变。打印里除了 loss 还有特征宽度 4。宽度更大不代表这四步的损失一定更小。

```numpy run expect="loss" title="三次特征"
# 三次特征的宽度是 4
import numpy as np
import minitorch as mt
rng = np.random.default_rng(0)
x = rng.random((32, 1)) * 2.0 - 1.0
col = x[:, 0]
target = 0.4 + 1.1 * col - 0.7 * (col ** 2)
feat = np.column_stack([np.ones(32), col, col ** 2, col ** 3])
w = mt.tensor(np.zeros(feat.shape[1]), requires_grad=True)
last = 0.0
for _ in range(4):
    w.grad = None
    pred = mt.tensor(feat) @ w
    yt = mt.tensor(target)
    loss = ((pred - yt) * (pred - yt)).mean()
    loss.backward()
    w.data -= 0.3 * w.grad
    last = loss.item()
print("loss", round(last, 4), "width", feat.shape[1])
```

### 四步看不出谁过拟合

过拟合通常要看训练损失下降而留出损失变大。这里两段都只训练四步，目的是把两种特征的更新都跑通，不比较最终精度。

延伸阅读：[欠拟合和过拟合](https://zh.d2l.ai/chapter_multilayer-perceptrons/underfit-overfit.html)，英文页在[这里](https://d2l.ai/chapter_multilayer-perceptrons/underfit-overfit.html)。
