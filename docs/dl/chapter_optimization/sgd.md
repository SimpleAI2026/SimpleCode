---
language: dl
chapter: 82
title: "随机梯度下降"
level: intermediate
minutes: 8
goals:
  - "每步只用一个样本"
  - "更新四次"
  - "把损失和全数据平均分开"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-13"
---

三十二个点的标签是 0.5 倍的 x。每步只取一个下标，用那一个点的平方损失更新斜率，一共四步。

### 一次一个点

种子是 0，斜率从 0 开始，学习率 0.1。第四步的那一个点的损失打印成 loss。它不是全部三十二个点的平均。

```numpy run expect="loss" title="单样本四步"
# 每步一个下标
import numpy as np
rng = np.random.default_rng(0)
x = rng.normal(0.0, 1.0, size=32)
y = 0.5 * x
w = 0.0
last = 0.0
for step in range(4):
    i = step
    pred = w * x[i]
    loss = (pred - y[i]) ** 2
    grad = 2.0 * (pred - y[i]) * x[i]
    w -= 0.1 * grad
    last = loss
print("loss", round(last, 4))
```

### 步数和样本量

打印写明每步一个样本、一共四步。批量大于 1 的情形留在机翼那一节。

```numpy run expect="sample 1 steps 4" title="样本量"
# 批量是 1
print("sample", 1, "steps", 4)
```

### 小批量取四行

下一节每次用四行机翼数据。梯度是这四行的平均，而不是这一节的单行。

延伸阅读：[随机梯度下降](https://zh.d2l.ai/chapter_optimization/sgd.html)，英文页在[这里](https://d2l.ai/chapter_optimization/sgd.html)。
